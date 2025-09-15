const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

let chatHistory = [];
let botName = "🐛 SâuGPT";
let nickname = "bạn";

// Gửi tin nhắn
async function sendMessage() {
  const message = inputEl.value.trim();
  if (!message) return;

  addMessage("user", `${nickname}: ${message}`);
  inputEl.value = "";

  chatHistory.push({ role: "user", content: message });

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory })
    });
    const data = await res.json();

    if (data.reply) {
      addMessage("bot", `${botName}: ${data.reply}`);
      chatHistory.push({ role: "assistant", content: data.reply });
    } else {
      addMessage("bot", "❌ Lỗi server!");
    }
  } catch {
    addMessage("bot", "❌ Không kết nối được server!");
  }
}

function addMessage(sender, text) {
  const msgEl = document.createElement("div");
  msgEl.className = `message ${sender}`;
  msgEl.innerHTML = formatText(text);
  chatEl.appendChild(msgEl);
  chatEl.scrollTop = chatEl.scrollHeight;
}

// Format code
function formatText(text) {
  return text.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre><code>${escapeHtml(code)}</code> <button onclick="copyCode(this)">📋</button></pre>`;
  });
}

function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;");
}

function copyCode(btn) {
  const code = btn.previousSibling.innerText;
  navigator.clipboard.writeText(code);
  btn.innerText = "✅";
  setTimeout(() => (btn.innerText = "📋"), 2000);
}

// Xuất chat
function exportChat() {
  let text = chatHistory.map(m => `${m.role}: ${m.content}`).join("\n");
  let blob = new Blob([text], { type: "text/plain" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "chat.txt";
  a.click();
}

// Modal nickname
function openNickname() {
  document.getElementById("nickname-modal").style.display = "flex";
}
function closeNickname() {
  document.getElementById("nickname-modal").style.display = "none";
}
function saveNickname() {
  botName = document.getElementById("bot-name").value || botName;
  nickname = document.getElementById("user-name").value || nickname;
  addMessage("bot", `Xin chào ${nickname} 👋! Hôm nay chúng ta sẽ làm script gì đây?`);
  closeNickname();
}

// New chat
function newChat() {
  chatEl.innerHTML = "";
  chatHistory = [];
}

// Sidebar toggle
document.getElementById("menu-btn").onclick = () =>
  document.getElementById("sidebar").classList.toggle("active");

// Theme toggle
document.getElementById("theme-toggle").onclick = () => {
  document.body.classList.toggle("dark");
  document.getElementById("theme-toggle").innerText =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
};

sendBtn.onclick = sendMessage;
inputEl.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
