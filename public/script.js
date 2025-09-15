// ====== UI refs ======
const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const themeToggle = document.getElementById("theme-toggle");

// nickname modal elements assumed present (if you used earlier HTML)
const botNameInput = document.getElementById("bot-name");
const userNameInput = document.getElementById("user-name");

// ====== State ======
let chatHistory = []; // full history sent to server (user + assistant)
let botName = localStorage.getItem("saugpt_botname") || "🐛 SâuGPT";
let userNick = localStorage.getItem("saugpt_useralias") || "Bạn";

// initial system prompt (kept and updated dynamically)
let baseSystemPrompt = `Bạn là SâuGPT, một trợ lý chuyên về code — đặc biệt là Lua cho Roblox. Trả lời chi tiết khi cần, đặt đoạn code trong khối ``` ``` và cung cấp nút sao chép. Luôn tôn trọng người dùng và tránh nội dung vi phạm.`;

// ====== Utility: detect simple user tone/personality ======
// returns { tone: "cheerful"|"impatient"|"formal"|"neutral", hints: "..."}
function detectToneFromText(text){
  const t = text.toLowerCase();
  // quick heuristics
  const cheers = ["haha","hihi","😊","😀","😁","cool","ok","okie","okie!","lol","vui","vui quá","đùa","đùa thôi"];
  const impatients = ["sao","tau","mệt","ngứa","đmm","đéo","gấp","khẩn","ngay","luôn","không được","ko được","wtf"];
  const polite = ["xin","làm ơn","cảm ơn","nhờ","vui lòng","mình muốn"];
  const excited = ["wow","tuyệt","đỉnh","cool","hay quá","điên","siêu"];

  let score = 0;
  for (let w of cheers) if (t.includes(w)) score += 1;
  for (let w of excited) if (t.includes(w)) score += 1;
  for (let w of polite) if (t.includes(w)) score += 0.8;
  for (let w of impatients) if (t.includes(w)) score -= 2;

  // punctuation heuristics
  if (/[!]{2,}/.test(text)) score += 0.6;
  if (/[?]{2,}/.test(text)) score -= 0.4;
  if (text.length < 3 && /[a-z0-9]+/.test(text)) score -= 0.6; // short monosyllable -> maybe curt

  // choose tone
  if (score > 1.4) return { tone: "cheerful", hint: "Vui vẻ, thân mật, sử dụng emoji và đôi khi đùa cợt." };
  if (score > 0.3) return { tone: "friendly", hint: "Thân thiện, lịch sự, dùng emoji nhẹ." };
  if (score < -1.0) return { tone: "impatient", hint: "Ngắn gọn, ưu tiên tóm tắt, hạn chế lan man, trả lời nhanh." };
  if (score < -0.3) return { tone: "direct", hint: "Thẳng, ngắn gọn, ít emoji." };
  return { tone: "neutral", hint: "Trung tính, lịch sự, đầy đủ giải thích." };
}

// Build a dynamic system prompt (merge base + personality + nickname rules)
function buildSystemPrompt(personality){
  const userLine = `Người dùng hiện tại được gọi là: "${userNick}".`;
  const personaLine = (function(){
    switch(personality.tone){
      case "cheerful":
        return "Phong cách trả lời: vui vẻ, thân mật, hay dùng emoji, có thể đùa nhẹ. Nếu viết code, vẫn giữ cấu trúc rõ ràng.";
      case "friendly":
        return "Phong cách trả lời: thân thiện, lịch sự, dùng emoji nhẹ.";
      case "impatient":
        return "Phong cách trả lời: ngắn gọn, ưu tiên câu trả lời nhanh, chỉ rõ bước thực hiện, ít dẫn giải dài dòng.";
      case "direct":
        return "Phong cách trả lời: trực tiếp, súc tích, ít dùng emoji.";
      case "neutral":
      default:
        return "Phong cách trả lời: trung tính, đầy đủ giải thích, lịch sự.";
    }
  })();

  const nicknameLine = `Khi người dùng gọi bằng biệt danh (ví dụ: "đại ca"), hãy dùng biệt danh đó trong cách xưng hô, ví dụ: "Nay anh cần gì, đại ca?" (không lạm dụng, chỉ khi phù hợp).`;

  // also remind the assistant it's an expert in Lua
  const luaLine = `Chú ý: Bạn là chuyên gia code, đặc biệt là Lua/Roblox. Khi người dùng yêu cầu code, hãy trả lời bằng ví dụ chạy được nếu có thể, tách đoạn code trong khối ```lua ...```.`;

  return [baseSystemPrompt, userLine, personaLine, nicknameLine, luaLine].join("\n\n");
}

// ====== UI helpers: add messages, code blocks, copy ======
function addMessage(sender, text){
  const msg = document.createElement("div");
  msg.className = "message " + (sender === "user" ? "user" : "bot");

  // Meta line
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerText = (sender === "user") ? `${userNick}:` : `${botName}:`;
  msg.appendChild(meta);

  // content handling: code blocks preserved, normal text as paragraphs
  const content = document.createElement("div");
  content.className = "content";

  // split by ``` blocks
  const parts = text.split(/(```[\s\S]*?```)/g);
  parts.forEach(part => {
    if (!part) return;
    if (part.startsWith("```")){
      // extract language if specified
      const inner = part.replace(/^```/, "").replace(/```$/, "");
      const codeEl = document.createElement("pre");
      codeEl.className = "code-block";
      const codeTag = document.createElement("code");
      codeTag.textContent = inner;
      codeEl.appendChild(codeTag);

      // copy button
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.innerText = "Sao chép";
      copyBtn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(inner);
        copyBtn.innerText = "Đã sao chép!";
        setTimeout(()=> copyBtn.innerText = "Sao chép", 1400);
      });

      const wrapper = document.createElement("div");
      wrapper.className = "code-wrapper";
      wrapper.appendChild(codeEl);
      wrapper.appendChild(copyBtn);
      content.appendChild(wrapper);
    } else {
      const p = document.createElement("div");
      p.className = "txt";
      // preserve line breaks
      p.innerText = part;
      content.appendChild(p);
    }
  });

  msg.appendChild(content);
  chatEl.appendChild(msg);
  chatEl.scrollTop = chatEl.scrollHeight;
}

// typing indicator
function addTyping(){
  const t = document.createElement("div");
  t.className = "message bot typing";
  t.innerHTML = `<div class="meta">${botName}:</div><div class="content"><span class="dots">● ● ●</span></div>`;
  chatEl.appendChild(t);
  chatEl.scrollTop = chatEl.scrollHeight;
  return t;
}
function removeTyping(el){
  if (!el) return;
  if (el.parentNode) el.parentNode.removeChild(el);
}

// ====== send workflow ======
async function sendWorkflow(rawText){
  if (!rawText) return;
  // show user message
  addMessage("user", rawText);

  // detect personality from message (quick)
  const detected = detectToneFromText(rawText);

  // rebuild system prompt
  const systemPrompt = buildSystemPrompt(detected);

  // prepare messages to send to server
  // We keep chatHistory as user/assistant messages only, but we include system as first message in payload
  const payloadMessages = [
    { role: "system", content: systemPrompt },
    ...chatHistory
  ];

  // push user message to local history too (so server has full history)
  chatHistory.push({ role: "user", content: rawText });

  // show typing indicator
  const typingEl = addTyping();

  try {
    const resp = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payloadMessages })
    });
    if (!resp.ok){
      removeTyping(typingEl);
      addMessage("bot", "⚠️ Lỗi server hoặc API Key. Vui lòng kiểm tra server.");
      console.error("Server error", resp.status, await resp.text());
      return;
    }
    const data = await resp.json();

    // openai compat: reply content may be in different paths
    const reply = (data.choices && data.choices[0] && (data.choices[0].message?.content || data.choices[0].text)) || data.reply || data.output_text || "Không có phản hồi.";

    removeTyping(typingEl);

    // optionally adjust reply: personalize address if user set nickname
    let personalized = reply.replace(/\{user\}/g, userNick); // allow server to use {user}
    // append playful touch if detected tone = cheerful
    if (detected.tone === "cheerful"){
      // if reply is short, tack on emoji
      personalized = personalized + " 😊";
    } else if (detected.tone === "impatient"){
      // be concise (server should follow, but we can truncate if too long)
      if (personalized.length > 800) personalized = personalized.slice(0,800) + "…";
    }

    // push assistant message to local history and display
    chatHistory.push({ role: "assistant", content: reply });
    // show with typing effect for non-code parts
    await renderWithTypingEffect(personalized);
  } catch (err){
    removeTyping(typingEl);
    addMessage("bot", "❌ Không thể kết nối server. Thử lại sau.");
    console.error(err);
  }
}

// typing effect that preserves code blocks
async function renderWithTypingEffect(fullText){
  // split code blocks
  const segs = fullText.split(/(```[\s\S]*?```)/g);
  for (let seg of segs){
    if (!seg) continue;
    if (seg.startsWith("```")) {
      // append code block immediately
      addMessage("bot", seg);
    } else {
      // reveal char by char
      let acc = "";
      const wrapper = document.createElement("div");
      wrapper.className = "message bot";
      wrapper.innerHTML = `<div class="meta">${botName}:</div><div class="content"></div>`;
      chatEl.appendChild(wrapper);
      const contentDiv = wrapper.querySelector(".content");
      for (let i = 0; i < seg.length; i++){
        acc += seg[i];
        contentDiv.textContent = acc;
        chatEl.scrollTop = chatEl.scrollHeight;
        await new Promise(r => setTimeout(r, 6 + Math.random() * 8));
      }
    }
  }
}

// ====== UI wiring ======
sendBtn.onclick = () => {
  const v = inputEl.value.trim();
  if (!v) return;
  inputEl.value = "";
  sendWorkflow(v);
};

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// menu + theme toggles (if exists)
if (menuBtn) menuBtn.onclick = () => sidebar.classList.toggle("active");
if (themeToggle) themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  themeToggle.innerText = document.body.classList.contains("dark") ? "☀️" : "🌙";
};

// nickname saving helpers if modal inputs present
function saveNicknameFromModal(){
  const bn = botNameInput?.value?.trim();
  const un = userNameInput?.value?.trim();
  if (bn) { botName = bn; localStorage.setItem("saugpt_botname", bn); }
  if (un) { userNick = un; localStorage.setItem("saugpt_useralias", un); }
  addMessage("bot", `Xin chào ${userNick}! Nay chúng ta sẽ làm script gì đây, ${userNick}?`);
  // close modal UI should be done in HTML event handler
}

// expose small helpers to global (if HTML buttons call them)
window.saveNicknameFromModal = saveNicknameFromModal;
window.newChat = function(){ chatEl.innerHTML = ""; chatHistory = []; addMessage("bot", `Xin chào ${userNick}! Mời bạn hỏi.`); };
window.openNickname = function(){ document.getElementById("nickname-modal").style.display = "flex"; };
window.closeNickname = function(){ document.getElementById("nickname-modal").style.display = "none"; };
window.exportChat = function(){
  const text = chatHistory.map(m => `${m.role}: ${m.content}`).join("\n\n");
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "saugpt_chat.txt"; a.click();
};

// initial greeting
addMessage("bot", `Xin chào! Tôi là ${botName}. Tốt nghiệp chuyên ngành code (đặc biệt là LUA)!!!`);
