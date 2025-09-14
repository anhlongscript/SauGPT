// ============ CONFIG ============
const OPENAI_API_KEY = "YOUR_API_KEY_HERE"; // ⚠️ thay key thật vào

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
const toggleTheme = document.getElementById("toggleTheme");

let messages = [
  { role: "system", content: "Bạn là SâuGPT, trợ lý thân thiện, trả lời rõ ràng, có thể viết code và tách block code với nút sao chép." }
];

// load names
function loadNames(){
  const bot = localStorage.getItem("saugpt_botname") || "SâuGPT";
  const alias = localStorage.getItem("saugpt_useralias") || "Bạn";
  botNamePreview.textContent = bot;
  botNameInput.value = bot;
  userAliasInput.value = alias;
}
loadNames();

// sidebar toggle
hamburger.addEventListener("click", ()=> sidebar.classList.toggle("collapsed"));
btnNickname.addEventListener("click", ()=> nickModal.classList.remove("hidden"));

// modal actions
saveNick.addEventListener("click", ()=>{
  localStorage.setItem("saugpt_botname", botNameInput.value || "SâuGPT");
  localStorage.setItem("saugpt_useralias", userAliasInput.value || "Bạn");
  loadNames();
  nickModal.classList.add("hidden");
});
cancelNick.addEventListener("click", ()=> nickModal.classList.add("hidden"));

// new chat
btnNewChat.addEventListener("click", ()=>{
  messages = [{ role: "system", content: "Bạn là SâuGPT, trợ lý thân thiện." }];
  chatEl.innerHTML = "";
  addBotText("Xin chào! Mời bạn nhập câu hỏi.");
});

// append message
function appendMessage(who, text){
  const wrapper = document.createElement("div");
  wrapper.className = "message " + (who === "user" ? "user" : "bot");

  const meta = document.createElement("div");
  meta.className = "meta";
  const alias = localStorage.getItem("saugpt_useralias") || "Bạn";
  meta.innerText = who === "user" ? alias + ":" : (localStorage.getItem("saugpt_botname") || "SâuGPT") + ":";

  const content = document.createElement("div");
  content.className = "content";

  // parse code blocks ```...```
  const parts = text.split(/```([\s\S]*?)```/);
  for (let i = 0; i < parts.length; i++){
    if (i % 2 === 0){
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
      copyBtn.addEventListener("click", async ()=>{
        await navigator.clipboard.writeText(code.textContent);
        copyBtn.textContent = "Đã sao chép!";
        setTimeout(()=> copyBtn.textContent = "Sao chép", 1500);
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

// add quick messages
function addUserText(txt){ appendMessage("user", txt); }
function addBotText(txt){ appendMessage("bot", txt); }

// typing indicator
function addTypingIndicator(){
  const div = document.createElement("div");
  div.className = "message bot typing";
  div.innerHTML = `<div class="meta">${localStorage.getItem("saugpt_botname") || "SâuGPT"}:</div>
                   <div class="content"><span class="typing-dots">...</span></div>`;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}
function removeTypingIndicator(el){
  if(el && el.parentNode) el.parentNode.removeChild(el);
}

// gọi API OpenAI
async function fetchOpenAI(messages){
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // bạn có thể đổi
      messages: messages
    })
  });
  const data = await res.json();
  if(data.error){
    return "⚠️ Lỗi: " + data.error.message;
  }
  return data.choices[0].message.content;
}

// send message
async function sendMessage(text){
  messages.push({ role:"user", content: text });
  const typingEl = addTypingIndicator();

  try {
    const reply = await fetchOpenAI(messages);
    removeTypingIndicator(typingEl);
    addBotText(reply);
    messages.push({ role:"assistant", content: reply });
  } catch(e){
    removeTypingIndicator(typingEl);
    addBotText("❌ Lỗi kết nối API: " + e.message);
  }
}

// UI events
sendBtn.addEventListener("click", async ()=>{
  const txt = userInput.value.trim();
  if(!txt) return;
  addUserText(txt);
  userInput.value = "";
  await sendMessage(txt);
});
userInput.addEventListener("keydown", (e)=>{
  if (e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    sendBtn.click();
  }
});

// theme
function loadTheme(){
  const theme = localStorage.getItem("saugpt_theme") || "light";
  document.body.setAttribute("data-theme", theme);
  toggleTheme.textContent = theme === "light" ? "🌙" : "☀️";
}
toggleTheme.addEventListener("click", ()=>{
  const current = document.body.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.body.setAttribute("data-theme", next);
  localStorage.setItem("saugpt_theme", next);
  toggleTheme.textContent = next === "light" ? "🌙" : "☀️";
});
loadTheme();

// initial greeting
(function init(){
  const bot = localStorage.getItem("saugpt_botname") || "SâuGPT";
  addBotText(`Xin chào! Tôi là ${bot} — hỏi gì mình giúp nhé.`);
})();
