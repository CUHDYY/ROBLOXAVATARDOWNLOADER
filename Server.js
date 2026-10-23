
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.get("/", (req, res) => {
  res.send("Avatar Downloader backend is running!");
});

app.get("/api/avatar", async (req, res) => {
  try {
    const username = String(req.query.username || "").trim();

    if (!username || username.length > 20) {
      return res.status(400).json({ error: "Enter a valid username." });
    }

    const response = await fetch(
      "https://users.roblox.com/v1/usernames/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      }
    );

    if (!response.ok) {
      throw new Error("Roblox lookup failed");
    }

    const data = await response.json();
    const user = data.data?.[0];

    if (!user) {
      return res.status(404).json({ error: "Username not found." });
    }

    res.json({
      userId: user.id,
      username: user.name,
      displayName: user.displayName
    });
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: "Could not contact Roblox." });
  }
});

app.get("/api/avatar-image", async (req, res) => {
  try {
    const userId = String(req.query.userId || "");

    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const response = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );

    if (!response.ok) {
      throw new Error("Thumbnail lookup failed");
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.imageUrl;

    if (!imageUrl) {
      return res.status(404).json({ error: "Avatar not found." });
    }

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error("Image download failed");
    }

    res.setHeader(
      "Content-Type",
      imageResponse.headers.get("content-type") || "image/png"
    );

    res.setHeader("Cache-Control", "public, max-age=300");

    res.send(Buffer.from(await imageResponse.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: "Could not load avatar image." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
