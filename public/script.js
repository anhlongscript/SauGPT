document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("userInput");
  const box = document.getElementById("messages");

  function add(sender, text) {
    const el = document.createElement("div");
    el.className = sender === "Bạn" ? "msg user" : "msg bot";
    el.innerHTML = `<strong>${sender}:</strong> ${text}`;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    add("Bạn", message);
    input.value = "";

    try {
      const resp = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await resp.json().catch(() => ({ error: "Invalid JSON" }));
      if (resp.ok && data.reply) add("SâuGPT", data.reply);
      else add("SâuGPT", "❌ Lỗi: " + (data.error || "Không rõ"));
    } catch (err) {
      add("SâuGPT", "❌ Kết nối server thất bại");
    }
  });
});
