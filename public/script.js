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

let messages = [{
  role: "system",
  content: "Bạn là SâuGPT, trợ lý thân thiện, trả lời rõ ràng, có thể viết code và chia thành block, và tách code trong thành khối có nút sao chép."
}];

// Load nicknames từ localStorage
function loadNames() {
  const bot = localStorage.getItem("saugpt_botname") || "SâuGPT";
  const alias = localStorage.getItem("saugpt_useralias") || "Bạn";
  botNamePreview.textContent = bot;
  botNameInput.value = bot;
  userAliasInput.value = alias;
}
loadNames();

// Sidebar toggle
hamburger.addEventListener("click", () => sidebar.classList.toggle("collapsed"));
btnNickname.addEventListener("click", () => nickModal.classList.remove("hidden"));

// Modal actions
saveNick.addEventListener("click", () => {
  localStorage.setItem("saugpt_botname", botNameInput.value || "SâuGPT");
  localStorage.setItem("saugpt_useralias", userAliasInput.value || "Bạn");
  loadNames();
  nickModal.classList.add("hidden");
});
cancelNick.addEventListener("click", () => nickModal.classList.add("hidden"));

// New chat
btnNewChat.addEventListener("click", () => {
  messages = [{
    role: "system",
    content: "Bạn là SâuGPT, trợ lý thân thiện, trả lời rõ ràng, có thể viết code và chia thành block."
  }];
  chatEl.innerHTML = "";
  addBotText("Xin chào! Mời bạn nhập câu hỏi.");
});

// Append message (supports code blocks & copy)
function appendMessage(who, text) {
  const wrapper = document.createElement("div");
  wrapper.className = "message " + (who === "user" ? "user" : "bot");

  const meta = document.createElement("div");
  meta.className = "meta";
  const alias = localStorage.getItem("saugpt_useralias") || "Bạn";
  meta.innerText = who === "user"
    ? alias + ":"
    : (localStorage.getItem("saugpt_botname") || "SâuGPT") + ":";

  const content = document.createElement("div");
  content.className = "content";

  // Parse code blocks
  const parts = text.split(/```/);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      const p = document.createElement("div");
      p.innerText = parts[i];
      content.appendChild(p);
    } else {
      const pre = document.createElement("pre");
      pre.className = "code-block";
      const code = document.createElement("code");
      code.textContent = parts[i];
      pre.appendChild(code);

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "Sao chép";
      copyBtn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(code.textContent);
        copyBtn.textContent = "Đã sao chép!";
        setTimeout(() => copyBtn.textContent = "Sao chép", 1500);
      });

      pre.appendChild(copyBtn);
      content.appendChild(pre);
    }
  }

  wrapper.appendChild(meta);
  wrapper.appendChild(content);
  chatEl.appendChild(wrapper);
  chatEl.scrollTop = chatEl.scrollHeight;
}

// Helpers
function addUserText(txt) { appendMessage("user", txt); }
function addBotText(txt) { appendMessage("bot", txt); }

function addTypingIndicator() {
  const div = document.createElement("div");
  div.className = "message bot typing";
  div.innerHTML =
    `<div class="meta">${localStorage.getItem("saugpt_botname") || "SâuGPT"}:</div>
     <div class="content"><span class="typing-dots"><span></span><span></span><span></span></span></div>`;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}

function removeTypingIndicator(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

// Gửi message tới server
async function sendMessage(text, base64Image) {
  messages.push({ role: "user", content: text });
  const typingEl = addTypingIndicator();

  try {
    const resp = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    if (!resp.ok) {
      const err = await resp.text();
      removeTypingIndicator(typingEl);
      addBotText("⚠️ Có lỗi xảy ra (API Key sai hoặc server lỗi).");
      console.error("Server non-OK:", resp.status, err);
      return;
    }

    const data = await resp.json();
    const reply =
      (data.choices && data.choices[0] &&
        (data.choices[0].message?.content || data.choices[0].text)) ||
      data.output_text || "Không có phản hồi.";

    removeTypingIndicator(typingEl);
    await renderWithTypingEffect(reply);
    messages.push({ role: "assistant", content: reply });

  } catch (e) {
    removeTypingIndicator(typingEl);
    addBotText("⚠️ Lỗi server. Vui lòng thử lại");
    console.error(e);
  }
}

// Render typing effect
async function renderWithTypingEffect(fullText) {
  const segments = fullText.split(/(```[\s\S]*?```)/g);
  for (let seg of segments) {
    if (!seg) continue;
    if (seg.startsWith("```")) {
      const codeContent = seg.replace(/```/g, "");
      appendMessage("bot", "```" + codeContent + "```");
    } else {
      let acc = "";
      const partialWrap = document.createElement("div");
      partialWrap.className = "message bot";
      partialWrap.innerHTML =
        `<div class="meta">${localStorage.getItem("saugpt_botname") || "SâuGPT"}:</div>
         <div class="content"></div>`;
      chatEl.appendChild(partialWrap);
      const contentDiv = partialWrap.querySelector(".content");

      for (let i = 0; i < seg.length; i++) {
        acc += seg[i];
        contentDiv.textContent = acc;
        chatEl.scrollTop = chatEl.scrollHeight;
        await new Promise(r => setTimeout(r, 6 + Math.random() * 6));
      }
    }
  }
}

// UI events
sendBtn.addEventListener("click", async () => {
  const txt = userInput.value.trim();
  const file = imageInput.files[0];
  if (!txt && !file) return;

  if (file) {
    const base64 = await toBase64(file);
    appendMessage("user", "[Hình ảnh gửi kèm]");
    const img = document.createElement("img");
    img.src = base64;
    img.style.maxWidth = "240px";
    img.style.display = "block";
    img.style.marginTop = "8px";
    chatEl.lastElementChild.querySelector(".content").appendChild(img);

    const note = txt ? txt + " (kèm hình ảnh gửi ở trên)" : "(kèm hình ảnh)";
    userInput.value = "";
    imageInput.value = "";
    addUserText(note);
    await sendMessage(note, base64);
    return;
  }

  addUserText(txt);
  userInput.value = "";
  await sendMessage(txt, null);
});

// Enter key support
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// Base64 helper
function toBase64(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

// Initial greeting
(function init() {
  const bot = localStorage.getItem("saugpt_botname") || "SâuGPT";
  addBotText(`Xin chào! Tôi là ${bot} — hỏi gì mình giúp nhé.`);
})();
