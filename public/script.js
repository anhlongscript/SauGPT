let mode = null; // GenZ hoặc Coder

document.getElementById("genzMode").addEventListener("click", () => {
  mode = "genz";
  startChat();
});

document.getElementById("coderMode").addEventListener("click", () => {
  mode = "coder";
  startChat();
});

function startChat() {
  document.getElementById("mode-select").classList.add("hidden");
  document.getElementById("chat-screen").classList.remove("hidden");
  addMessage("bot", "🐛 Xin chào! Bạn đã chọn " + (mode === "genz" ? "🔥 GenZ Mode" : "👨‍💻 Coder Mode"));
}

function addMessage(sender, text) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = (sender === "user" ? "Bạn: " : "SâuGPT: ") + text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById("send").addEventListener("click", async () => {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  addMessage("user", message);
  input.value = "";

  // API gọi theo mode
  let systemPrompt = "";
  if (mode === "genz") {
    systemPrompt = "Bạn là SâuGPT 🐛 ở chế độ GenZ. Trả lời kiểu vui tính, cà khịa, dùng icon.";
  } else {
    systemPrompt = "Bạn là SâuGPT 🐛 — chuyên gia lập trình (đặc biệt là Lua Roblox nhưng hiểu Python, HTML, JS...). Luôn trả lời thân thiện.";
  }

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, systemPrompt })
    });

    const data = await res.json();
    addMessage("bot", data.reply || "❌ Lỗi server!");
  } catch (e) {
    addMessage("bot", "❌ Lỗi kết nối server!");
  }
});
