const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.querySelector(".menu-toggle");
const themeToggle = document.getElementById("themeToggle");

let messages = [{
  role: "system",
  content: "Bạn là 🐛 SâuGPT, một trợ lý AI chuyên viết code. Bạn tốt nghiệp chuyên ngành code (đặc biệt là Lua Roblox). Luôn đưa code vào block có nút sao chép và giải thích ngắn gọn."
}];

let botName = localStorage.getItem("saugpt_botname") || "🐛 SâuGPT";
let userAlias = localStorage.getItem("saugpt_useralias") || "bạn";

function addMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = "message " + sender;

  if (text.includes("```")) {
    let parts = text.split(/```/);
    parts.forEach((part, i) => {
      if (i % 2 === 0) {
        if (part.trim()) msg.innerHTML += part.trim() + "<br>";
      } else {
        const codeBlock = document.createElement("div");
        codeBlock.className = "code-block";
        codeBlock.textContent = part.trim();
        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "📋";
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(codeBlock.textContent);
          copyBtn.textContent = "✅";
          setTimeout(() => copyBtn.textContent = "📋", 1500);
        };
        codeBlock.appendChild(copyBtn);
        msg.appendChild(codeBlock);
      }
    });
  } else {
    msg.innerText = text;
  }

  chatEl.appendChild(msg);
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  addMessage(text, "user");
  inputEl.value = "";

  messages.push({ role: "user", content: text });

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    const data = await res.json();
    const reply = data.reply || "❌ Lỗi server!";
    addMessage(reply, "bot");
    messages.push({ role: "assistant", content: reply });
  } catch {
    addMessage("⚠️ API Key sai hoặc server lỗi.", "bot");
  }
}

sendBtn.onclick = sendMessage;
inputEl.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

menuToggle.onclick = () => sidebar.classList.toggle("active");
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};

document.getElementById("newChat").onclick = () => {
  chatEl.innerHTML = "";
  messages = [messages[0]];
  addMessage(`Xin chào! Tôi là ${botName}. Nay chúng ta sẽ làm script gì đây, ${userAlias}?`);
};

document.getElementById("setAlias").onclick = () => {
  const bot = prompt("Đặt tên cho SâuGPT:", botName);
  const alias = prompt("Chúng tôi nên gọi bạn như nào?", userAlias);
  if (bot) { botName = bot; localStorage.setItem("saugpt_botname", bot); }
  if (alias) { userAlias = alias; localStorage.setItem("saugpt_useralias", alias); }
  addMessage(`Xin chào! Tôi là ${botName}. Nay chúng ta sẽ làm script gì đây, ${userAlias}?`);
};

(function init() {
  addMessage(`Xin chào! Tôi là ${botName}. Nay chúng ta sẽ làm script gì đây, ${userAlias}?`);
})();
