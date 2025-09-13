const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // hiện tin nhắn user
  addMessage("Bạn", message, "user");
  userInput.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();

    if (data.reply) {
      addMessage("GPT", data.reply, "bot", true);
    } else {
      addMessage("GPT", "❌ Lỗi server!", "bot");
    }
  } catch (err) {
    addMessage("GPT", "⚠️ Kết nối thất bại!", "bot");
  }
}

function addMessage(sender, text, cls, allowCopy=false) {
  const div = document.createElement("div");
  div.className = `message ${cls}`;
  div.innerHTML = `<b>${sender}:</b> ${text}`;
  
  if (allowCopy) {
    const btn = document.createElement("span");
    btn.className = "copy-btn";
    btn.innerText = "[Copy]";
    btn.onclick = () => navigator.clipboard.writeText(text);
    div.appendChild(btn);
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
