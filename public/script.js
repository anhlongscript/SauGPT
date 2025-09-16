// UI refs
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const btnNewChat = document.getElementById("btnNewChat");
const btnNickname = document.getElementById("btnNickname");
const nickModal = document.getElementById("nickModal");
const botNameInput = document.getElementById("botName");
const userAliasInput = document.getElementById("userAlias");
const saveNick = document.getElementById("saveNick");
const cancelNick = document.getElementById("cancelNick");
const botNamePreview = document.getElementById("botNamePreview");
const chatEl = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const imageInput = document.getElementById("imageInput");

// Admin
const adminBtn = document.getElementById("admin-btn");
const adminKey = document.getElementById("admin-key");
const adminStatus = document.getElementById("admin-status");
let isAdmin = false;

let messages = [
  {
    role: "system",
    content:
      "Bạn là SâuGPT, trợ lý thân thiện chuyên về code (đặc biệt là Lua Roblox). Hãy trả lời rõ ràng, có thể viết code, chia block với nút sao chép."
  }
];

// Load names
function loadNames() {
  const bot = localStorage.getItem("saugpt_botname") || "SâuGPT";
  const alias = localStorage.getItem("saugpt_useralias") || "Bạn";
  botNamePreview.textContent = bot;
  botNameInput.value = bot;
  userAliasInput.value = alias;
}
loadNames();

// Sidebar toggle
hamburger.addEventListener("click", () =>
  sidebar.classList.toggle("collapsed")
);
btnNickname.addEventListener("click", () => {
  nickModal.classList.remove("hidden");
});

// Modal actions
saveNick.addEventListener("click", () => {
  localStorage.setItem("saugpt_botname", botNameInput.value || "SâuGPT");
  localStorage.setItem("saugpt_useralias", userAliasInput.value || "Bạn");
  loadNames();
  nickModal.classList.add("hidden");
});
cancelNick.addEventListener("click", () =>
  nickModal.classList.add("hidden")
);

// New chat
btnNewChat.addEventListener("click", () => {
  messages = [
    {
      role: "system",
      content:
        "Bạn là SâuGPT, trợ lý thân thiện chuyên về code (đặc biệt là Lua Roblox)."
    }
  ];
  chatEl.innerHTML = "";
  addBotText("Xin chào! Mời bạn nhập câu hỏi.");
});

// Append message
function appendMessage(who, text) {
  const wrapper = document.createElement("div");
  wrapper.className = "message " + (who === "user" ? "user" : "bot");

  const meta = document.createElement("div");
  meta.className = "meta";
  const alias = localStorage.getItem("saugpt_useralias") || "Bạn";
  meta.innerText =
    who === "user"
      ? alias + ":"
      : (localStorage.getItem("saugpt_botname") || "SâuGPT") + ":";

  const content = document.createElement("div");
  content.className = "content";
  content.innerText = text;

  wrapper.appendChild(meta);
  wrapper.appendChild(content);
  chatEl.appendChild(wrapper);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function addUserText(txt) {
  appendMessage("user", txt);
}
function addBotText(txt) {
  appendMessage("bot", txt);
}

// Admin check
adminBtn.addEventListener("click", () => {
  if (adminKey.value.trim() === "admin099") {
    isAdmin = true;
    adminStatus.classList.remove("hidden");
    alert("✅ Đã bật chế độ Admin!");
  } else {
    isAdmin = false;
    adminStatus.classList.add("hidden");
    alert("❌ Key sai, bạn không phải admin!");
  }
});

// Send message
async function sendMessage(text) {
  messages.push({ role: "user", content: text });

  try {
    const resp = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    if (!resp.ok) {
      addBotText("⚠️ Có lỗi xảy ra (API Key sai hoặc server lỗi).");
      if (isAdmin) console.error("Server error:", resp.status);
      return;
    }

    const data = await resp.json();
    const reply =
      (data.choices &&
        data.choices[0] &&
        (data.choices[0].message?.content || data.choices[0].text)) ||
      data.output_text ||
      "Không có phản hồi.";

    addBotText(reply);
    messages.push({ role: "assistant", content: reply });

    if (isAdmin) console.log("📡 API Debug:", data);
  } catch (e) {
    addBotText("⚠️ Lỗi server. Vui lòng thử lại.");
    if (isAdmin) console.error("🔥 Lỗi chi tiết:", e);
  }
}

// Events
sendBtn.addEventListener("click", async () => {
  const txt = userInput.value.trim();
  if (!txt) return;
  addUserText(txt);
  userInput.value = "";
  await sendMessage(txt);
});

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// Init greeting
(function init() {
  const bot = localStorage.getItem("saugpt_botname") || "SâuGPT";
  const alias = localStorage.getItem("saugpt_useralias") || "Bạn";
  addBotText(`Xin chào ${alias} 👋! Hôm nay mình sẽ giúp bạn viết code Roblox Lua nhé!`);
})();
