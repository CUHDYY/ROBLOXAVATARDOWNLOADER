
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#facc15">
<title>Avatar Downloader</title>
<style>
*{box-sizing:border-box}
:root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#18181b}
html,body{margin:0;width:100%;min-height:100%;overflow-x:hidden}
body{min-height:100vh;min-height:100dvh;padding:16px 12px;display:flex;justify-content:center;align-items:center;background:#fffbea}
main{width:100%;max-width:440px;min-width:0;padding:clamp(16px,5vw,28px);background:white;border:2px solid #facc15;border-radius:22px;box-shadow:0 12px 34px #7159001f}
h1{margin:0 0 8px;text-align:center;font-size:clamp(1.55rem,7vw,2.05rem);overflow-wrap:anywhere}
.sub{text-align:center;color:#52525b;margin:0 0 22px;line-height:1.45}
form{display:flex;flex-wrap:wrap;gap:9px;width:100%}
input{width:100%;min-width:0;flex:1 1 180px;padding:14px;border:1px solid #d4d4d8;border-radius:12px;font:inherit;font-size:16px}
button,.download{display:flex;align-items:center;justify-content:center;min-height:48px;padding:12px 16px;border:0;border-radius:12px;background:#facc15;color:#18181b;font:inherit;font-weight:800;text-decoration:none;cursor:pointer}
button{flex:1 1 100px}
button:disabled{opacity:.65}
#status{min-height:24px;margin:15px 0;text-align:center;color:#52525b;overflow-wrap:anywhere}
#result{display:none;text-align:center}
#avatar{display:block;width:min(100%,280px);max-width:100%;aspect-ratio:1;object-fit:contain;margin:0 auto 15px;background:#fffbea;border:1px solid #f3e6a2;border-radius:16px}
#username{margin:0 0 15px;font-weight:700;overflow-wrap:anywhere}
.download{width:100%;background:#18181b;color:white}
.note{margin:20px 0 0;color:#71717a;font-size:.78rem;line-height:1.5;text-align:center}
@media(max-width:360px){
 body{padding-left:10px;padding-right:10px}
 main{padding:16px;border-radius:18px}
 form{flex-direction:column}
 input,button{width:100%;flex-basis:auto}
}
</style>
</head>
<body>
<main>
<h1>Avatar Downloader</h1>
<p class="sub">Find a public Roblox avatar and save its image.</p>

<form id="searchForm">
<input id="usernameInput" placeholder="Enter Roblox username" autocomplete="off" maxlength="20" required>
<button id="searchButton" type="submit">Search</button>
</form>

<p id="status" role="status" aria-live="polite"></p>

<section id="result">
<img id="avatar" alt="Roblox avatar preview">
<p id="username"></p>
<a id="downloadButton" class="download" href="#" download>Download avatar PNG</a>
</section>

<p class="note">Unofficial fan-made tool. Uses public Roblox profile data only. Never enter your Roblox password or cookie.</p>
</main>

<script>
/*
IMPORTANT:
GitHub Pages cannot run a Node.js backend.
Put your deployed backend URL here, without a trailing slash.
Example: https://your-service.onrender.com
*/
const API_BASE = "https://YOUR-BACKEND-URL";

const form = document.getElementById("searchForm");
const input = document.getElementById("usernameInput");
const button = document.getElementById("searchButton");
const status = document.getElementById("status");
const result = document.getElementById("result");
const avatar = document.getElementById("avatar");
const usernameLabel = document.getElementById("username");
const downloadButton = document.getElementById("downloadButton");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = input.value.trim();

  if (!username) {
    status.textContent = "Enter a Roblox username first.";
    return;
  }

  if (API_BASE.includes("YOUR-BACKEND-URL")) {
    status.textContent = "Backend not connected yet. It must be deployed before search can work.";
    return;
  }

  button.disabled = true;
  result.style.display = "none";
  status.textContent = "Looking up avatar…";

  try {
    const response = await fetch(
      `${API_BASE}/api/avatar?username=${encodeURIComponent(username)}`
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Could not find that Roblox user.");
    }

    if (!data.userId || !data.username) {
      throw new Error("Roblox returned incomplete user data.");
    }

    const imageURL =
      `${API_BASE}/api/avatar-image?userId=${encodeURIComponent(data.userId)}`;

    avatar.onerror = () => {
      status.textContent = "Avatar image failed to load. Check the backend URL.";
    };

    avatar.src = imageURL;
    avatar.alt = `Avatar of ${data.username}`;
    usernameLabel.textContent = data.username;

    downloadButton.href = `${imageURL}&download=1`;
    downloadButton.download = `${data.username}-avatar.png`;

    result.style.display = "block";
    status.textContent = "Avatar found!";
  } catch (error) {
    status.textContent =
      error.message || "Could not load avatar. Please try again.";
  } finally {
    button.disabled = false;
  }
});
</script>
</body>
</html>
