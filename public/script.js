const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("input");
let messages = [{ role: "system", content: "Bạn là SâuGPT, AI vui tính." }];

function addMessage(role, content) {
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.textContent = (role === "user" ? "🧑: " : "🤖: ") + content;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function sendMsg() {
  const text = inputEl.value.trim();
  if (!text) return;
  addMessage("user", text);
  inputEl.value = "";

  messages.push({ role: "user", content: text });

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "❌ Lỗi server!";
    addMessage("bot", reply);
    messages.push({ role: "assistant", content: reply });
  } catch (err) {
    console.error("Fetch error:", err);
    addMessage("bot", "⚠️ Không kết nối được server.");
  }
}
