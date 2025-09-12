document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const messages = document.getElementById("messages");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // hiển thị tin nhắn user
    addMessage("Bạn", userMessage);
    input.value = "";

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      addMessage("SâuGPT", data.reply || "❌ Có lỗi xảy ra, thử lại nhé.");
    } catch (err) {
      console.error(err);
      addMessage("SâuGPT", "❌ Lỗi server rồi bro!");
    }
  });

  function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = "message";
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }
});
