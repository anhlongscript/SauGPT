const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

let chatHistory = [];
let nickname = "bạn"; // mặc định

// Gửi tin nhắn
async function sendMessage() {
  const message = inputEl.value.trim();
  if (!message) return;

  addMessage("Bạn", message);
  inputEl.value = "";

  chatHistory.push({ role: "user", content: message });

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory })
    });

    const data = await response.json();
    if (data.reply) {
      addMessage("🐛 SâuGPT", data.reply.replace(/```/g, "\n```")); // giữ format code
      chatHistory.push({ role: "assistant", content: data.reply });
    } else {
      addMessage("🐛 SâuGPT", "❌ Lỗi server!");
    }
  } catch (err) {
    addMessage("🐛 SâuGPT", "❌ Không kết nối được đến server.");
  }
}

// Thêm tin nhắn vào khung chat
function addMessage(sender, text) {
  const msgEl = document.createElement("div");
  msgEl.className = "message";
  msgEl.innerHTML = `<strong>${sender}:</strong><br>${formatText(text)}`;
  chatEl.appendChild(msgEl);
  chatEl.scrollTop = chatEl.scrollHeight;
}

// Format code block
function formatText(text) {
  return text.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre><code>${escapeHtml(code)}</code> <button onclick="copyCode(this)">📋</button></pre>`;
  });
}

// Escape HTML để không bị lỗi khi hiển thị code
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;");
}

// Copy code
function copyCode(btn) {
  const code = btn.previousSibling.innerText;
  navigator.clipboard.writeText(code);
  btn.innerText = "✅";
  setTimeout(() => (btn.innerText = "📋"), 2000);
}

sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
