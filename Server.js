
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send("Roblox Avatar Downloader backend is running!");
});

app.post("/api/avatar", express.json(), async (req, res) => {
  try {
    const response = await fetch(
      "https://users.roblox.com/v1/usernames/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [req.body.username],
          excludeBannedUsers: true
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: "Roblox lookup failed." });
    }

    const user = data.data?.[0];

    if (!user) {
      return res.status(404).json({ error: "Username not found." });
    }

    res.json({
      userId: user.id,
      username: user.name,
      displayName: user.displayName
    });
  } catch {
    res.status(500).json({ error: "Backend request failed." });
  }
});

app.get("/api/avatar-image", async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const response = await fetch(
      "https://thumbnails.roblox.com/v1/users/avatar?userIds=" +
      userId + "&size=420x420&format=Png&isCircular=false"
    );

    if (!response.ok) {
      return res.status(502).json({ error: "Thumbnail lookup failed." });
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.imageUrl;

    if (!imageUrl) {
      return res.status(404).json({ error: "Avatar image not found." });
    }

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return res.status(502).json({ error: "Could not fetch avatar image." });
    }

    res.setHeader(
      "Content-Type",
      imageResponse.headers.get("content-type") || "image/png"
    );

    res.setHeader("Cache-Control", "public, max-age=300");

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    res.send(imageBuffer);
  } catch {
    res.status(500).json({ error: "Avatar request failed." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
