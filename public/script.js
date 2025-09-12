const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function appendMessage(sender, message) {
  const msg = document.createElement("div");
  msg.innerHTML = `<b>${sender}:</b> ${message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("Bạn", message);
  userInput.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    appendMessage("Sâu🐛GPT", data.reply);
  } catch (err) {
    appendMessage("Sâu🐛GPT", "❌ Lỗi kết nối server.");
  }
});
