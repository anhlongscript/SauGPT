const chatEl = document.getElementById("chat");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const typingEl = document.getElementById("typing");
const dotsEl = document.getElementById("dots");

let nickname = "đại ca";
let themeDark = false;
let mood = "bình thường";

// Loading chấm nhảy
let dotCount = 0;
setInterval(() => {
  if (!typingEl.classList.contains("hidden")) {
    dotCount = (dotCount + 1) % 4;
    dotsEl.textContent = ".".repeat(dotCount);
  }
}, 500);

// Toggle sidebar
document.getElementById("menuBtn").onclick = () => {
  document.getElementById("sidebar").classList.toggle("hidden");
};

// Nút New Chat
document.getElementById("newChatBtn").onclick = () => {
  chatEl.innerHTML = "";
};

// Nút đặt biệt danh
document.getElementById("setNicknameBtn").onclick = () => {
  const botName = prompt("Đặt tên cho SâuGPT:", "SâuGPT");
  const userName = prompt("Chúng tôi nên gọi bạn như nào:", "đại ca");
  if (userName) nickname = userName;
  addMessage("bot", `Xin chào ${nickname} 👋! Mình là ${botName || "SâuGPT"} – tốt nghiệp chuyên ngành code (đặc biệt là LUA Roblox)!!!`);
};

// Nút đổi theme
document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("dark");
};

// Chat submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  addMessage("user", text);
  userInput.value = "";

  typingEl.classList.remove("hidden");

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, nickname, mood })
  });

  typingEl.classList.add("hidden");

  if (!res.ok) {
    addMessage("bot", "❌ Lỗi server!");
    return;
  }

  const data = await res.json();
  addMessage("bot", data.reply);
});

function addMessage(sender, text) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.innerHTML = `<b>${sender === "user" ? nickname : "Đàn em"}:</b> ${text}`;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}
