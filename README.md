# ROBLOXAVATARDOWNLOADER 
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RBX Avatar Downloader</title>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 25px 16px;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  color: white;
  background: #0c0d14;
}

.container {
  max-width: 650px;
  margin: auto;
}

header {
  text-align: center;
  margin: 20px 0 45px;
}

.logo {
  display: inline-block;
  background: #7957ff;
  padding: 12px 16px;
  border-radius: 15px;
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 10px;
}

h1 {
  font-size: 34px;
  margin: 12px 0;
}

h1 span {
  color: #9d83ff;
}

.subtitle {
  color: #a5a7ba;
  line-height: 1.6;
}

.search-box {
  display: flex;
  gap: 10px;
  margin: 25px 0;
}

input {
  flex: 1;
  min-width: 0;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #34364a;
  background: #191b29;
  color: white;
  font-size: 16px;
  outline: none;
}

button, .download {
  padding: 14px 18px;
  background: #7957ff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

button:hover, .download:hover {
  background: #9277ff;
}

button:disabled {
  opacity: 0.6;
}

.status {
  text-align: center;
  color: #b9b0ff;
  line-height: 1.5;
  margin: 20px 0;
  overflow-wrap: anywhere;
}

.card {
  display: none;
  background: #191b29;
  border: 1px solid #34364a;
  padding: 22px;
  border-radius: 18px;
  text-align: center;
}

.card.show {
  display: block;
}

.avatar {
  width: 100%;
  max-width: 340px;
  aspect-ratio: 1;
  object-fit: contain;
  display: block;
  margin: 15px auto;
  background: #222438;
  border-radius: 15px;
}

.username {
  font-size: 23px;
  font-weight: bold;
  overflow-wrap: anywhere;
}

.small {
  color: #a5a7ba;
  font-size: 13px;
}

.download {
  margin-top: 10px;
}

footer {
  margin-top: 35px;
  color: #85879b;
  font-size: 12px;
  text-align: center;
  line-height: 1.7;
}

@media (max-width: 480px) {
  .search-box {
    flex-direction: column;
  }

  .search-box button {
    width: 100%;
  }

  h1 {
    font-size: 29px;
  }
}
</style>
</head>

<body>
<div class="container">

<header>
  <div class="logo">RBX</div>
  <h1>Avatar <span>Downloader</span></h1>
  <p class="subtitle">
    Search any public Roblox username.<br>
    Preview the avatar and download the image!
  </p>
</header>

<form id="searchForm" class="search-box">
  <input
    id="usernameInput"
    type="text"
    placeholder="Enter Roblox username..."
    autocomplete="off"
    maxlength="20"
    required
  >
  <button id="searchButton" type="submit">
    Search
  </button>
</form>

<div id="status" class="status" role="status"></div>

<div id="card" class="card">
  <div id="displayName" class="username"></div>
  <p id="accountName" class="small"></p>

  <img id="avatar" class="avatar" alt="Roblox avatar">

  <a id="download" class="download" href="#" download>
    ⬇ Download Avatar PNG
  </a>

  <p>
    <a id="profile" class="small"
       href="#" target="_blank"
       rel="noopener noreferrer">
       View Roblox Profile ↗
    </a>
  </p>

  <p class="small">
    This downloads the rendered avatar image, not a 3D model.
  </p>
</div>

<footer>
  No Roblox password required.<br>
  Unofficial fan-made tool. Not affiliated with Roblox.
</footer>

</div>

<script>
const form = document.getElementById("searchForm");
const input = document.getElementById("usernameInput");
const button = document.getElementById("searchButton");
const status = document.getElementById("status");
const card = document.getElementById("card");
const avatar = document.getElementById("avatar");
const download = document.getElementById("download");

function message(text, error = false) {
  status.textContent = text;
  status.style.color = error ? "#ff8f9d" : "#b9b0ff";
}

async function getJSON(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      "Roblox API error (" + response.status + "). Please try again."
    );
  }

  return response.json();
}

async function findUser(username) {
  const data = await getJSON(
    "https://users.roblox.com/v1/usernames/users",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false
      })
    }
  );

  return data.data && data.data.length
    ? data.data[0]
    : null;
}

async function getAvatar(userId) {
  const url = new URL(
    "https://thumbnails.roblox.com/v1/users/avatar"
  );

  url.search = new URLSearchParams({
    userIds: userId,
    size: "720x720",
    format: "Png",
    isCircular: "false"
  });

  const data = await getJSON(url.toString());
  const result = data.data && data.data[0];

  if (!result || !result.imageUrl) {
    throw new Error("Could not load the avatar image.");
  }

  return result.imageUrl;
}

form.addEventListener("submit", async function(event) {
  event.preventDefault();

  const username = input.value.trim();

  if (!username) return;

  button.disabled = true;
  button.textContent = "Searching...";
  card.classList.remove("show");
  message("Searching Roblox for @" + username + "...");

  try {
    const user = await findUser(username);

    if (!user) {
      throw new Error(
        "Username not found! Check the spelling and try again."
      );
    }

    const imageUrl = await getAvatar(user.id);

    document.getElementById("displayName").textContent =
      user.displayName || user.name;

    document.getElementById("accountName").textContent =
      "@" + user.name + " · ID: " + user.id;

    avatar.src = imageUrl;
    avatar.alt = "Roblox avatar for " + user.name;

    document.getElementById("profile").href =
      "https://www.roblox.com/users/" + user.id + "/profile";

    // Use the Roblox image URL returned by the thumbnail API.
    download.href = imageUrl;
    download.download = user.name + "-avatar.png";

    download.onclick = async function(event) {
      event.preventDefault();

      try {
        // Try downloading the image directly as a file.
        const response = await fetch(imageUrl);

        if (!response.ok) throw new Error("Download blocked");

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = objectUrl;
        link.download = user.name + "-avatar.png";
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      } catch (error) {
        // Fallback for browsers that block cross-origin downloads.
        window.open(imageUrl, "_blank", "noopener,noreferrer");
        message(
          "Image opened in a new tab. Use Save Image to save it."
        );
      }
    };

    card.classList.add("show");
    message("Avatar found! 🎉");

  } catch (error) {
    message(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Search";
  }
});
</script>
</body>
</html>
