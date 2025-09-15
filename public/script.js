const botName = "🐛 SâuGPT";
let userName = "đại ca"; // bạn có thể thay bằng nickname mình đặt

async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (text === "") return;

  addMessage("Bạn", text, "user");
  input.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: `Bạn là ${botName}, chuyên về code Roblox Lua, vui tính, sử dụng icon, và luôn xưng hô với "${userName}".` },
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    addMessage(botName, reply, "bot");

  } catch (error) {
    addMessage(botName, "❌ Lỗi server!", "bot");
  }
}

function addMessage(sender, message, type) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = type;
  msg.innerHTML = `<b>${sender}:</b> ${message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
