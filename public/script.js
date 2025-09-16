let adminUnlocked = false;
let consoleVisible = true;

function appendMessage(sender, text, isCode = false) {
  const messagesDiv = document.getElementById("messages");
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + sender;

  if (isCode) {
    const codeDiv = document.createElement("div");
    codeDiv.className = "code-block";
    codeDiv.textContent = text;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.innerText = "📋 Copy";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text);
      copyBtn.innerText = "✅ Copied!";
      setTimeout(() => (copyBtn.innerText = "📋 Copy"), 2000);
    };

    codeDiv.appendChild(copyBtn);
    msgDiv.appendChild(codeDiv);
  } else {
    msgDiv.textContent = text;
  }

  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  if (adminUnlocked && consoleVisible) {
    logAdmin(`[${sender}] ${text}`);
  }
}

function sendMessage() {
  const input = document.getElementById("userInput");
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage("user", msg);
  input.value = "";

  // fake bot reply demo
  if (msg.toLowerCase().includes("code")) {
    appendMessage("bot", "print('Hello Roblox!')", true);
  } else {
    appendMessage("bot", "SâuGPT 🐛 xin chào! Bạn cần gì?");
  }
}

function checkKey() {
  const key = document.getElementById("adminKey").value;
  if (key === "admin0999") {
    adminUnlocked = true;
    document.getElementById("consoleContainer").classList.remove("hidden");
    appendMessage("bot", "🔓 Đã mở khóa console admin!");
  } else {
    alert("❌ Sai key!");
  }
}

function toggleConsole() {
  consoleVisible = !consoleVisible;
  document.getElementById("adminConsole").classList.toggle("hidden");
}

function logAdmin(msg) {
  const consoleEl = document.getElementById("adminConsole");
  consoleEl.textContent += msg + "\n";
}
