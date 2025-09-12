function appendMessage(sender, message) {
  const chatBox = document.getElementById("chat-box");
  const msgDiv = document.createElement("div");

  if (sender === "Sâu🐛GPT") {
    // Xử lý code block dạng ```lang ... ```
    let formatted = message.replace(/```(\w+)?([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });
    msgDiv.innerHTML = `<b style="color:limegreen">${sender}:</b> ${formatted}`;
  } else {
    msgDiv.innerHTML = `<b style="color:dodgerblue">${sender}:</b> ${message}`;
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  appendMessage("Bạn", text);
  input.value = "";

  // Fake trả lời từ SâuGPT
  setTimeout(() => {
    if (text.includes("code")) {
      appendMessage("Sâu🐛GPT", `Chắc chắn rồi! Đây là code mẫu nè:
\`\`\`lua
local player = game.Players.LocalPlayer
print("Xin chào từ Sâu🐛GPT!")
\`\`\``);
    } else {
      appendMessage("Sâu🐛GPT", "Tôi đã nhận được tin nhắn của bạn 🐛✨");
    }
  }, 1000);
}
