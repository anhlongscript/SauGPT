const API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = ""; // Dán key nếu chạy local, còn Render thì để trống

async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY || (window.env && window.env.OPENAI_API_KEY)}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!response.ok) {
      throw new Error("⚠️ API Key sai hoặc server lỗi.");
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    addMessage(reply, "bot");
  } catch (err) {
    addMessage(err.message, "bot");
  }
}

function addMessage(text, sender) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
