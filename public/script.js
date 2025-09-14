// Elements
const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const historyEl = document.getElementById("chat-history");
const newChatBtn = document.getElementById("new-chat");
const toggleSidebarBtn = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");
const setNicknameBtn = document.getElementById("set-nickname");
const modal = document.getElementById("nickname-modal");
const closeModalBtn = document.getElementById("close-modal");
const saveNicknameBtn = document.getElementById("save-nickname");
const botNameEl = document.getElementById("bot-name");
const userNameEl = document.getElementById("user-name");
const themeBtn = document.getElementById("toggle-theme");

let botName = "Sâu GPT 🐛";
let userName = "Bạn";
let chats = [];
let currentChat = [];

// ====== Utils ======
function addMessage(sender, text) {
  const msgEl = document.createElement("div");
  msgEl.className = `message ${sender}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";

  // Detect code block
  if (text.includes("```")) {
    const code = text.replace(/```[a-z]*\n?/, "").replace(/```$/, "");
    const pre = document.createElement("pre");
    pre.textContent = code;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(code);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    };

    pre.appendChild(copyBtn);
    bubble.appendChild(pre);
  } else {
    bubble.textContent = text;
  }

  msgEl.appendChild(bubble);
  chatEl.appendChild(msgEl);
  chatEl.scrollTop = chatEl.scrollHeight;
  currentChat.push({ sender, text });
}

// ====== Events ======
sendBtn.onclick = async () => {
  const text = inputEl.value.trim();
  if (!text) return;
  addMessage("user", `${userName}: ${text}`);
  inputEl.value = "";

  // fake bot reply
  addMessage("bot", `${botName}: Bạn vừa nói "${text}" đúng không? 😁`);
};

newChatBtn.onclick = () => {
  if (currentChat.length) chats.push(currentChat);
  currentChat = [];
  chatEl.innerHTML = "";
};

toggleSidebarBtn.onclick = () => {
  sidebar.classList.toggle("hidden");
};

setNicknameBtn.onclick = () => {
  modal.classList.remove("hidden");
};

closeModalBtn.onclick = () => {
  modal.classList.add("hidden");
};

saveNicknameBtn.onclick = () => {
  botName = botNameEl.value || botName;
  userName = userNameEl.value || userName;
  modal.classList.add("hidden");
};

themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};
