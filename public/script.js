const API_URL = "https://api.openai.com/v1/chat/completions";
// ⚠️ KEY không để trực tiếp ở đây nếu public, mà set trong Render Environment
const API_KEY = ""; // Nếu chạy local test thì bỏ key vào đây

function addMessage(text, sender) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function newChat() {
  document.getElementById("chat").innerHTML = "";
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY || (window.API_KEY || "")}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Xin lỗi, không nhận được phản hồi.";
    addMessage(reply, "bot");
  } catch (error) {
    console.error(error);
    addMessage("⚠️ Có lỗi xảy ra (API Key sai hoặc server lỗi).", "bot");
  }
}
