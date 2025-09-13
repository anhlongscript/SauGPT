const chatEl = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const menuBtn = document.getElementById("menuBtn");
const closeSidebar = document.getElementById("closeSidebar");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const setNicknameBtn = document.getElementById("setNickname");
const newChatBtn = document.getElementById("newChat");
const nicknameModal = document.getElementById("nicknameModal");
const closeModal = document.querySelector(".modal .close");
const saveNickname = document.getElementById("saveNickname");
const userNicknameInput = document.getElementById("userNickname");
const botNicknameInput = document.getElementById("botNickname");
const title = document.getElementById("title");
const themeToggle = document.getElementById("themeToggle");

let userNickname = "Bạn";
let botNickname = "Sâu GPT";

// Xử lý gửi tin nhắn
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatEl.appendChild(msg);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(`${userNickname}: ${text}`, "user");

  // Giả lập trả lời từ bot
  setTimeout(() => {
    addMessage(`${botNickname}: Tôi đã nhận được: "${text}"`, "bot");
  }, 500);

  userInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Sidebar toggle
menuBtn.addEventListener("click", () => {
  sidebar.classList.add("active");
  overlay.classList.add("active");
});
closeSidebar.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});
overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

// New chat
newChatBtn.addEventListener("click", () => {
  chatEl.innerHTML = "";
  addMessage(`${botNickname}: Xin chào! Hãy bắt đầu một đoạn chat mới 😊`, "bot");
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

// Nickname modal
setNicknameBtn.addEventListener("click", () => {
  nicknameModal.style.display = "flex";
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

closeModal.addEventListener("click", () => {
  nicknameModal.style.display = "none";
});

saveNickname.addEventListener("click", () => {
  if (userNicknameInput.value) userNickname = userNicknameInput.value;
  if (botNicknameInput.value) {
    botNickname = botNicknameInput.value;
    title.textContent = botNickname;
  }
  nicknameModal.style.display = "none";
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  if (document.body.classList.contains("dark")) {
    document.body.classList.replace("dark", "light");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.replace("light", "dark");
    themeToggle.textContent = "🌙";
  }
});
