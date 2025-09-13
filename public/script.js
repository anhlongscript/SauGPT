const API_KEY = "YOUR_API_KEY_HERE"; // 🔑 thay bằng API key OpenAI của bạn

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  // Hiển thị typing
  const typing = addMessage("SâuGPT đang suy nghĩ...", "bot");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    typing.remove();

    if (data.choices && data.choices.length > 0) {
      const reply = data.choices[0].message.content;
      addMessage(reply, "bot");
    } else {
      addMessage("Xin lỗi, mình không thể trả lời ngay bây giờ.", "bot");
    }
  } catch (error) {
    typing.remove();
    addMessage("Có lỗi xảy ra, kiểm tra API key hoặc mạng nhé!", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
