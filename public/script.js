let messages = [{
  role: "system",
  content: "Bạn là SâuGPT 🐛, trợ lý vui tính, troll nhẹ, dùng emoji, luôn xưng hô theo biệt danh người dùng đặt. Bạn chuyên về code, đặc biệt là Lua Roblox."
}];

const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const botNameDisplay = document.getElementById("bot-name");
const editNickBtn = document.getElementById("edit-nick");
const nickModal = document.getElementById("nick-modal");
const saveNick = document.getElementById("save-nick");
const botNameInput = document.getElementById("bot-name-input");
const userAliasInput = document.getElementById("user-alias-input");
const themeToggle = document.getElementById("theme-toggle");

// Emoji random
function randomEmoji() {
  const list = ["😎", "🔥", "😂", "🤖", "👉", "💡", "🐛"];
  return list[Math.floor(Math.random() * list.length)];
}

// Thêm tin nhắn
function appendMessage(role, content) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", role);
  msgDiv.innerHTML = content;
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Tạo typing
function addTyping() {
  const el = appendMessage("assistant", "Đang nhập...");
  return el;
}

// Gửi tin nhắn
async function sendMessage(text) {
  appendMessage("user", text);
  userInput.value = "";
  messages.push({ role: "user", content: text });

  const typingEl = addTyping();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    const reply = (data.choices && data.choices[0].message?.content) || "Không có phản hồi.";
    typingEl.remove();

    const finalReply = reply + " " + randomEmoji();
    appendMessage("assistant", finalReply);

    messages.push({ role: "assistant", content: finalReply });
  } catch {
    typingEl.remove();
    appendMessage("assistant", "❌ Lỗi server rồi đại ca ơi!");
  }
}

sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (text) sendMessage(text);
});

// Biệt danh
function loadNames() {
  const botName = localStorage.getItem("saugpt_botname") || "SâuGPT 🐛";
  const userAlias = localStorage.getItem("saugpt_useralias") || "Bạn";
  botNameDisplay.textContent = botName;
  botNameInput.value = botName;
  userAliasInput.value = userAlias;
  return { botName, userAlias };
}

editNickBtn.addEventListener("click", () => {
  nickModal.classList.remove("hidden");
});

saveNick.addEventListener("click", () => {
  localStorage.setItem("saugpt_botname", botNameInput.value || "SâuGPT 🐛");
  localStorage.setItem("saugpt_useralias", userAliasInput.value || "Bạn");
  loadNames();
  nickModal.classList.add("hidden");
});

// Auto chào khi load trang
window.onload = () => {
  const { userAlias } = loadNames();
  appendMessage("assistant", `Xin chào ${userAlias} 👋! Hôm nay mình code Roblox Lua chứ? 🐛`);
};

// Dark / Light mode
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});
