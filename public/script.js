async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Hiển thị tin nhắn của user
  chatBox.innerHTML += `<div class="message user">Bạn: ${userMessage}</div>`;
  input.value = "";

  // Gửi tới server
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });
    const data = await res.json();

    chatBox.innerHTML += `<div class="message bot">Sâu🐛GPT: ${data.reply}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch {
    chatBox.innerHTML += `<div class="message bot">❌ Lỗi: Server không phản hồi.</div>`;
  }
}
