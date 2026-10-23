
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Roblox Avatar Downloader</title>
<style>
:root {
  --yellow: #ffdf00;
  --black: #0b0b0b;
  --panel: #151515;
  --white: #ffffff;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 25px 14px;
  min-height: 100vh;
  background: radial-gradient(ellipse at top, #302900, var(--black) 65%);
  color: var(--white);
  font-family: Arial, sans-serif;
}
header { text-align: center; margin: 15px auto 25px; }
.logo {
  display: inline-grid;
  place-items: center;
  width: 60px;
  height: 60px;
  background: var(--yellow);
  color: var(--black);
  border-radius: 16px;
  font-size: 30px;
  font-weight: 900;
}
h1 { font-size: clamp(25px, 6vw, 38px); }
h1 span { color: var(--yellow); }
.subtitle { color: #bbb; line-height: 1.5; }
.panel {
  max-width: 540px;
  margin: auto;
  padding: 22px;
  background: var(--panel);
  border: 1px solid #333;
  border-radius: 20px;
  box-shadow: 0 15px 45px #0008;
}
label { display: block; margin-bottom: 10px; font-weight: bold; }
.input-row { display: flex; gap: 10px; }
input {
  flex: 1;
  min-width: 0;
  padding: 14px;
  border: 1px solid #444;
  border-radius: 10px;
  background: #080808;
  color: white;
  font-size: 16px;
}
input:focus { outline: 2px solid var(--yellow); }
button, .download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  padding: 14px 16px;
  background: var(--yellow);
  color: #111;
  font-weight: 900;
  cursor: pointer;
  text-decoration: none;
}
button:disabled { opacity: .6; }
.hint, .note { color: #aaa; font-size: 12px; line-height: 1.5; }
.status { margin-top: 15px; line-height: 1.5; }
.result {
  display: none;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #333;
  text-align: center;
}
.avatar {
  display: block;
  width: min(100%, 300px);
  aspect-ratio: 1;
  object-fit: contain;
  margin: 0 auto 15px;
  background: #080808;
  border-radius: 16px;
}
.username { font-size: 20px; font-weight: bold; overflow-wrap: anywhere; }
.display-name { color: #bbb; margin-top: 6px; }
.download { margin-top: 17px; }
.note { max-width: 500px; margin: 20px auto; text-align: center; }
@media (max-width: 430px) {
  .input-row { flex-direction: column; }
  .panel { padding: 17px; }
  button { min-height: 48px; }
}
</style>
</head>
<body>
<header>
  <div class="logo">R</div>
  <h1>ROBLOX <span>AVATAR</span><br>DOWNLOADER</h1>
  <p class="subtitle">Search a Roblox username and view their avatar.</p>
</header>

<main class="panel">
  <form id="lookupForm">
    <label for="username">ROBLOX USERNAME</label>
    <div class="input-row">
      <input id="username" placeholder="Enter username..." maxlength="20" required>
      <button id="searchButton" type="submit">SEARCH AVATAR</button>
    </div>
    <p class="hint">Enter the account username, not the display name.</p>
  </form>

  <div id="status" class="status" role="status"></div>
  <div id="result" class="result">
    <img id="avatar" class="avatar" alt="Roblox avatar">
    <div id="resultUsername" class="username"></div>
    <div id="displayName" class="display-name"></div>
    <a id="downloadLink" class="download" target="_blank" rel="noopener">OPEN AVATAR IMAGE</a>
  </div>
</main>

<p class="note">Unofficial fan-made tool. Not affiliated with Roblox.</p>

<script>
const form = document.getElementById('lookupForm');
const input = document.getElementById('username');
const button = document.getElementById('searchButton');
const status = document.getElementById('status');
const result = document.getElementById('result');
const avatar = document.getElementById('avatar');
const resultUsername = document.getElementById('resultUsername');
const displayName = document.getElementById('displayName');
const downloadLink = document.getElementById('downloadLink');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = input.value.trim();
  if (!username) return;

  button.disabled = true;
  button.textContent = 'SEARCHING...';
  status.textContent = 'Searching Roblox...';
  result.style.display = 'none';

  try {
    const response = await fetch(
      'https://users.roblox.com/v1/usernames/users',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: true
        })
      }
    );

    if (!response.ok) throw new Error('Roblox lookup failed. Try again later.');

    const data = await response.json();
    const user = data.data && data.data[0];

    if (!user) throw new Error('Username not found. Check the spelling.');

    const url = 'https://thumbnails.roblox.com/v1/users/avatar?userIds='
      + encodeURIComponent(user.id)
      + '&size=420x420&format=Png&isCircular=false';

    const thumbResponse = await fetch(url);
    if (!thumbResponse.ok) throw new Error('Could not load the avatar.');

    const thumbData = await thumbResponse.json();
    const imageUrl = thumbData.data?.[0]?.imageUrl;

    if (!imageUrl) throw new Error('No avatar image was returned.');

    avatar.src = imageUrl;
    resultUsername.textContent = '@' + user.name;
    displayName.textContent = user.displayName || user.name;
    downloadLink.href = imageUrl;
    downloadLink.download = user.name + '-avatar.png';
    result.style.display = 'block';
    status.textContent = 'Avatar found!';
  } catch (error) {
    status.textContent = error.message ||
      'Something went wrong. Please try again.';
  } finally {
    button.disabled = false;
    button.textContent = 'SEARCH AVATAR';
  }
});
</script>
</body>
</html>
