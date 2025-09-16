/* ==== Client JS for SâuGPT ==== */

const CHAT_KEY = "saugpt_chats_v1";
const CURRENT_KEY = "saugpt_current_v1";
const BOTNAME_KEY = "saugpt_botname_v1";
const USERALIAS_KEY = "saugpt_useralias_v1";
const ADMINKEY_KEY = "saugpt_adminkey_v1";

let chats = JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
let currentChat = localStorage.getItem(CURRENT_KEY) || null;
let botName = localStorage.getItem(BOTNAME_KEY) || "SâuGPT";
let userAlias = localStorage.getItem(USERALIAS_KEY) || "Bạn";
let adminKeyStored = localStorage.getItem(ADMINKEY_KEY) || "";
let isAdmin = adminKeyStored === "admin099"; // default admin key

// DOM refs
const chatListEl = document.getElementById("chatList");
const messagesEl = document.getElementById("messages");
const newChatBtn = document.getElementById("new-chat-btn");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const botNameEl = document.getElementById("botName");

const adminKeyInput = document.getElementById("admin-key-input");
const adminCheckBtn = document.getElementById("admin-check-btn");
const adminBadge = document.getElementById("admin-badge");
const adminConsole = document.getElementById("adminConsole");
const adminLog = document.getElementById("adminLog");
const adminClearBtn = document.getElementById("adminClearBtn");
const adminCloseBtn = document.getElementById("adminCloseBtn");

const nicknameBox = document.getElementById("nicknameBox");
const botNicknameInput = document.getElementById("botNickname");
const userNicknameInput = document.getElementById("userNickname");
const saveNicknameBtn = document.getElementById("saveNicknameBtn");
const cancelNicknameBtn = document.getElementById("cancelNicknameBtn");

const renameCurrentBtn = document.getElementById("btn-rename-current");
const clearCurrentBtn = document.getElementById("btn-clear-current");

// init ui
botNameEl.textContent = botName;
botNicknameInput.value = botName;
userNicknameInput.value = userAlias;
adminKeyInput.value = adminKeyStored || "";

if (!currentChat || !chats[currentChat]) {
  // create default chat
  const defName = `Chat mới - ${new Date().toLocaleString()}`;
  chats[defName] = [];
  currentChat = defName;
  saveAll();
}
renderChatList();
switchChat(currentChat);
setAdminMode(isAdmin);
scrollMessagesToBottom();

/* ---------- Helpers ---------- */

function saveAll() {
  localStorage.setItem(CHAT_KEY, JSON.stringify(chats));
  localStorage.setItem(CURRENT_KEY, currentChat);
  localStorage.setItem(BOTNAME_KEY, botName);
  localStorage.setItem(USERALIAS_KEY, userAlias);
}

function logAdmin(msg, obj) {
  if (!isAdmin) return;
  const time = new Date().toLocaleTimeString();
  adminLog.textContent += `[${time}] ${msg}\n`;
  if (obj !== undefined) {
    try {
      adminLog.textContent += JSON.stringify(obj, null, 2) + "\n";
    } catch {
      adminLog.textContent += String(obj) + "\n";
    }
  }
  adminLog.scrollTop = adminLog.scrollHeight;
}

/* ---------- Chat list UI ---------- */

function renderChatList() {
  chatListEl.innerHTML = "";
  Object.keys(chats).forEach(name => {
    const li = document.createElement("li");
    li.className = "chat-item";

    const title = document.createElement("span");
    title.textContent = name;
    title.style.flex = "1";
    title.style.cursor = "pointer";
    title.onclick = () => switchChat(name);

    const renameBtn = document.createElement("button");
    renameBtn.textContent = "✏️";
    renameBtn.title = "Đổi tên";
    renameBtn.onclick = (e) => { e.stopPropagation(); renameChat(name); };

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.title = "Xóa đoạn chat";
    delBtn.onclick = (e) => { e.stopPropagation(); deleteChat(name); };

    li.appendChild(title);
    li.appendChild(renameBtn);
    li.appendChild(delBtn);
    chatListEl.appendChild(li);
  });
}

/* ---------- Chat switching / create / delete / rename ---------- */

function newChat() {
  const name = prompt("Đặt tên đoạn chat mới:", `Chat ${new Date().toLocaleString()}`);
  if (!name) return;
  if (chats[name]) {
    alert("Đã tồn tại tên đoạn chat, chọn tên khác.");
    return;
  }
  chats[name] = [];
  currentChat = name;
  saveAll();
  renderChatList();
  switchChat(name);
}

function deleteChat(name) {
  if (!confirm(`Xóa đoạn chat "${name}" ?`)) return;
  delete chats[name];
  if (name === currentChat) {
    const keys = Object.keys(chats);
    currentChat = keys.length ? keys[0] : null;
  }
  saveAll();
  renderChatList();
  if (currentChat) switchChat(currentChat);
  else messagesEl.innerHTML = "";
}

function renameChat(oldName) {
  const newName = prompt("Đổi tên đoạn chat:", oldName);
  if (!newName || newName === oldName) return;
  if (chats[newName] && newName !== oldName) {
    if (!confirm("Tên mới đã tồn tại. Gộp 2 đoạn chat này? OK để gộp, Cancel để hủy.")) return;
    // merge
    chats[newName] = [...chats[newName], ...chats[oldName]];
  } else {
    chats[newName] = chats[oldName];
  }
  delete chats[oldName];
  if (currentChat === oldName) currentChat = newName;
  saveAll();
  renderChatList();
  switchChat(currentChat);
}

/* ---------- Render messages ---------- */

function renderMessage(item) {
  if (item.code) {
    // code block
    const pre = document.createElement("pre");
    pre.className = "code-block";
    pre.textContent = item.code;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "📋 Sao chép";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(item.code);
      copyBtn.textContent = "✅ Đã sao chép";
      setTimeout(() => copyBtn.textContent = "📋 Sao chép", 1500);
    };
    pre.appendChild(copyBtn);
    messagesEl.appendChild(pre);
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "msg";

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${item.sender}:`;

  const text = document.createElement("div");
  text.className = "text";
  text.textContent = item.text;

  wrapper.appendChild(meta);
  wrapper.appendChild(text);
  messagesEl.appendChild(wrapper);
}

function renderChatContents(name) {
  messagesEl.innerHTML = "";
  const arr = chats[name] || [];
  arr.forEach(item => renderMessage(item));
  scrollMessagesToBottom();
}

/* ---------- switch chat ---------- */

function switchChat(name) {
  if (!chats[name]) return;
  currentChat = name;
  localStorage.setItem(CURRENT_KEY, currentChat);
  renderChatList();
  renderChatContents(name);

  // if chat empty, add greeting (local only)
  if (chats[name].length === 0) {
    const greet = { sender: botName, text: `Xin chào ${userAlias} 👋! Hôm nay mình giúp gì về Lua/Roblox?` , cls: "bot" };
    chats[name].push(greet);
    saveAll();
    renderChatContents(name);
  }
}

/* ---------- send message & server call ---------- */

async function sendMessageHandler() {
  const text = userInput.value.trim();
  if (!text || !currentChat) return;
  // push user message
  const userMsg = { sender: userAlias, text: text, cls: "user" };
  chats[currentChat].push(userMsg);
  saveAll();
  renderMessage(userMsg);
  scrollMessagesToBottom();
  userInput.value = "";

  // push thinking placeholder
  const thinking = { sender: botName, text: "⏳ Đang suy nghĩ...", cls: "bot", temp: true };
  chats[currentChat].push(thinking);
  renderMessage(thinking);
  scrollMessagesToBottom();

  // prepare history to send (exclude the just-added user message)
  const conversation = chats[currentChat].slice(0, -1); // everything before last user msg
  const history = conversation.map(item => {
    if (item.code) {
      return { role: "assistant", content: "```lua\n" + item.code + "\n```" };
    } else {
      return { role: item.cls === "user" ? "user" : "assistant", content: item.text };
    }
  });

  const body = { message: text, history };

  // prepare headers, include admin key header if admin
  const headers = { "Content-Type": "application/json" };
  if (isAdmin && adminKeyInput.value.trim()) headers["x-admin-key"] = adminKeyInput.value.trim();

  let resp, data;
  try {
    logAdmin("Request to /api/chat", { body, headers: isAdmin ? headers : "hidden" });
    resp = await fetch("/api/chat", { method: "POST", headers, body: JSON.stringify(body) });

    // parse response
    const textResp = await resp.text();
    try { data = JSON.parse(textResp); } catch { data = { error: textResp }; }

    if (!resp.ok) {
      // remove thinking placeholder
      removeLastTemp();
      const errMsg = data?.error || `Server trả về lỗi (${resp.status})`;
      const botErr = { sender: botName, text: `❌ Lỗi server! ${String(errMsg)}`, cls: "bot" };
      chats[currentChat].push(botErr);
      saveAll();
      renderMessage(botErr);
      logAdmin("Server error", { status: resp.status, body: data });
      return;
    }

    // success: remove thinking
    removeLastTemp();

    // handle reply + optional code
    const replyText = data.reply || "❌ Xin lỗi đại ca, em chưa hiểu.";
    if (data.code) {
      const botMsg = { sender: botName, text: replyText, cls: "bot" };
      const botCode = { sender: botName, code: data.code };
      chats[currentChat].push(botMsg);
      chats[currentChat].push(botCode);
      renderMessage(botMsg);
      renderMessage(botCode);
    } else {
      const botMsg = { sender: botName, text: replyText, cls: "bot" };
      chats[currentChat].push(botMsg);
      renderMessage(botMsg);
    }
    saveAll();

    // admin: show raw if present
    if (isAdmin && data.raw) {
      logAdmin("OpenAI raw response", data.raw);
    } else if (isAdmin) {
      logAdmin("OpenAI response", data);
    }
  } catch (err) {
    removeLastTemp();
    const botErr = { sender: botName, text: "❌ Lỗi kết nối tới server!", cls: "bot" };
    chats[currentChat].push(botErr);
    saveAll();
    renderMessage(botErr);
    logAdmin("Fetch exception", err);
  } finally {
    scrollMessagesToBottom();
  }
}

function removeLastTemp() {
  // remove last temp message from DOM and chats (the placeholder)
  // find last item with temp:true
  for (let i = chats[currentChat].length - 1; i >= 0; i--) {
    if (chats[currentChat][i].temp) {
      chats[currentChat].splice(i, 1);
      saveAll();
      // remove last element from DOM (we assume it's the last visible)
      if (messagesEl.lastChild) messagesEl.removeChild(messagesEl.lastChild);
      break;
    }
  }
}

/* ---------- UI event binds ---------- */

newChatBtn.onclick = newChat;
sendBtn.onclick = sendMessageHandler;
userInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessageHandler(); });

adminCheckBtn.onclick = () => {
  const val = adminKeyInput.value.trim();
  if (val === "") {
    isAdmin = false;
    setAdminMode(false);
    return;
  }
  // allow admin key (default admin099)
  if (val === "admin099") {
    isAdmin = true;
    adminKeyStored = val;
    localStorage.setItem(ADMINKEY_KEY, adminKeyStored);
    setAdminMode(true);
    alert("✅ Admin Mode đã bật.");
    logAdmin("Admin logged in");
  } else {
    isAdmin = false;
    setAdminMode(false);
    alert("❌ Key sai!");
  }
};

adminClearBtn.onclick = () => { adminLog.textContent = ""; };
adminCloseBtn.onclick = () => { isAdmin = false; setAdminMode(false); localStorage.removeItem(ADMINKEY_KEY); };

saveNicknameBtn.onclick = () => {
  botName = botNicknameInput.value.trim() || botName;
  userAlias = userNicknameInput.value.trim() || userAlias;
  botNameEl.textContent = botName;
  // store
  localStorage.setItem(BOTNAME_KEY, botName);
  localStorage.setItem(USERALIAS_KEY, userAlias);
  nicknameBox.classList.add("hidden");
  // add bot confirmation
  const confirmMsg = { sender: botName, text: "👌 Biệt danh đã được cập nhật!", cls: "bot" };
  chats[currentChat].push(confirmMsg);
  saveAll();
  renderMessage(confirmMsg);
  scrollMessagesToBottom();
};

cancelNicknameBtn.onclick = () => { nicknameBox.classList.add("hidden"); };

document.getElementById("btn-clear-current").onclick = () => {
  if (!currentChat) return;
  if (!confirm("Xóa hết nội dung trong đoạn chat này?")) return;
  chats[currentChat] = [];
  saveAll();
  switchChat(currentChat);
};

document.getElementById("btn-rename-current").onclick = () => {
  if (!currentChat) return;
  renameChat(currentChat);
};

/* ---------- admin UI helpers ---------- */

function setAdminMode(on) {
  isAdmin = !!on;
  if (isAdmin) {
    adminBadge.classList.remove("hidden");
    adminConsole.classList.remove("hidden");
    adminKeyInput.value = adminKeyInput.value || "admin099";
  } else {
    adminBadge.classList.add("hidden");
    adminConsole.classList.add("hidden");
    adminKeyInput.value = "";
    localStorage.removeItem(ADMINKEY_KEY);
  }
}

/* ---------- misc ---------- */

function showNicknameBox() {
  nicknameBox.classList.remove("hidden");
}
document.getElementById("saveNicknameBtn")?.addEventListener("click", () => saveNicknameBtn.click);

/* ---------- utilities ---------- */

function scrollMessagesToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
