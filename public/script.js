let nickname = "";
let currentChat = "";
let chats = {};
let isAdmin = false;

const messagesDiv = document.getElementById("messages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatList = document.getElementById("chatList");
const chatTitle = document.getElementById("chatTitle");
const consolePanel = document.getElementById("consolePanel");
const consoleLogs = document.getElementById("consoleLogs");

// Dark/Light theme
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.getElementById("themeToggle").textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Set nickname
document.getElementById("setNickname").addEventListener("click", () => {
  const name = prompt("Đặt tên cho SâuGPT:");
  const you = prompt("Chúng tôi nên gọi bạn như nào?");
  if (name && you) {
    chatTitle.textContent = name;
    nickname = you;
    addBotMessage(`Xin chào ${nickname} 👋! Hôm nay mình sẽ giúp bạn viết code Roblox Lua nhé!`);
  }
});

// New chat
document.getElementById("newChat").addEventListener("click", () => {
  const title = prompt("Đặt tên cho đoạn chat:");
  if (title) {
    chats[title] = [];
    currentChat = title;
    renderChatList();
    messagesDiv.innerHTML = "";
  }
});

// Check key
document.getElementById("checkKey").addEventListener("click", () => {
  const key = document.getElementById("adminKey").value;
  if (key === "admin099") {
    isAdmin = true;
    consolePanel.classList.remove("hidden");
    logToConsole("✅ Admin key accepted!");
  } else {
    alert("❌ Sai key!");
  }
});

// Send message
sendBtn.addEventListener("click", () => sendMessage());
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addUserMessage(text);
  userInput.value = "";

  // Fake bot reply (đại ca gắn API ở đây)
  setTimeout(() => {
    let reply = `Đàn em: Tôi đã nhận được lệnh "${text}" ${nickname ? nickname : ""}`;
    if (text.toLowerCase().includes("code")) {
      reply += `\n\n\`\`\`lua\nprint("Hello from Roblox Lua!")\n\`\`\``;
    }
    addBotMessage(reply);
  }, 500);
}

function addUserMessage(text) {
  const div = document.createElement("div");
  div.className = "message user";
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  saveMessage("user", text);
}

function addBotMessage(text) {
  const div = document.createElement("div");
  div.className = "message bot";

  // Detect code block
  if (text.includes("```")) {
    const parts = text.split("```");
    div.innerHTML = `<pre>${parts[1]}</pre>`;
    const btn = document.createElement("button");
    btn.textContent = "📋 Sao chép";
    btn.className = "copy-btn";
    btn.onclick = () => {
      navigator.clipboard.writeText(parts[1]);
      alert("Đã sao chép code!");
    };
    div.appendChild(btn);
  } else {
    div.textContent = text;
  }

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  saveMessage("bot", text);
}

function saveMessage(role, content) {
  if (!currentChat) return;
  chats[currentChat].push({ role, content });
}

function renderChatList() {
  chatList.innerHTML = "";
  for (let title in chats) {
    const li = document.createElement("li");
    li.textContent = title;
    li.onclick = () => {
      currentChat = title;
      loadChat(title);
    };
    chatList.appendChild(li);
  }
}

function loadChat(title) {
  messagesDiv.innerHTML = "";
  chats[title].forEach(m => {
    if (m.role === "user") addUserMessage(m.content);
    else addBotMessage(m.content);
  });
}

function logToConsole(msg) {
  if (isAdmin) {
    consoleLogs.textContent += msg + "\n";
  }
}
