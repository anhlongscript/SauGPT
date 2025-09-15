let botName = "🐛 SâuGPT";
let userName = "Bạn";

// gửi tin nhắn
document.getElementById("send-btn").addEventListener("click", sendMessage);

// Enter để gửi
document.getElementById("user-input").addEventListener("keypress", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// mở sidebar
document.getElementById("menu-btn").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = sidebar.style.display === "block" ? "none" : "block";
});

// đổi theme
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// gửi tin nhắn
function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (text === "") return;

  addMessage(userName, text, "user");
  input.value = "";

  // giả lập bot trả lời
  setTimeout(() => {
    let reply = `Xin chào ${userName} 👋! Hôm nay mình sẽ giúp bạn viết code Roblox Lua nhé!`;
    addMessage(botName, reply, "bot");
  }, 800);
}

// thêm tin nhắn vào chat
function addMessage(sender, text, type) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = "msg " + type;
  msg.innerHTML = `<b>${sender}:</b> ${text}`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

// modal biệt danh
function openNicknameModal() {
  document.getElementById("nickname-modal").style.display = "flex";
}

function closeNickname() {
  document.getElementById("nickname-modal").style.display = "none";
}

function saveNicknameFromModal() {
  const botInput = document.getElementById("bot-name").value.trim();
  const userInput = document.getElementById("user-name").value.trim();

  if (botInput) botName = botInput;
  if (userInput) userName = userInput;

  closeNickname();
}
