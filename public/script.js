let botName = "SâuGPT đẹp trai số 1 thế giới";
let userName = "bạn";
let chats = JSON.parse(localStorage.getItem("chats") || "{}");
let currentChat = null;

// Khi load web → hỏi tên đoạn chat đầu tiên
window.onload = () => {
  if (Object.keys(chats).length === 0) {
    newChat();
  } else {
    loadChatList();
    let firstChat = Object.keys(chats)[0];
    switchChat(firstChat);
  }
};

// Tạo đoạn chat mới
function newChat() {
  let name = prompt("Đặt tên đoạn chat:");
  if (!name) return;
  chats[name] = [];
  currentChat = name;
  saveChats();
  loadChatList();
  switchChat(name);
}

// Load danh sách chat
function loadChatList() {
  let ul = document.getElementById("chatList");
  ul.innerHTML = "";
  for (let name in chats) {
    let li = document.createElement("li");
    li.innerHTML = `<span onclick="switchChat('${name}')">${name}</span>
                    <button onclick="deleteChat('${name}')">🗑️</button>`;
    ul.appendChild(li);
  }
}

// Chuyển đoạn chat
function switchChat(name) {
  currentChat = name;
  document.getElementById("messages").innerHTML = "";
  chats[name].forEach(msg => renderMessage(msg));
}

// Xóa đoạn chat
function deleteChat(name) {
  if (confirm(`Xóa đoạn chat "${name}"?`)) {
    delete chats[name];
    saveChats();
    loadChatList();
    document.getElementById("messages").innerHTML = "";
  }
}

// Lưu vào localStorage
function saveChats() {
  localStorage.setItem("chats", JSON.stringify(chats));
}

// Render message
function renderMessage({ sender, text, cls, code }) {
  if (code) {
    showCode(code);
    return;
  }
  let msgBox = document.createElement("div");
  msgBox.className = "msg";
  msgBox.innerHTML = `<span class="${cls}">${sender}:</span> ${text}`;
  document.getElementById("messages").appendChild(msgBox);
  scrollToBottom();
}

// Gửi tin nhắn
async function sendMsg() {
  let input = document.getElementById("userInput");
  let text = input.value.trim();
  if (!text || !currentChat) return;

  let msg = { sender: userName, text, cls: "user" };
  chats[currentChat].push(msg);
  renderMessage(msg);
  saveChats();

  input.value = "";
  let thinking = { sender: botName, text: "⏳ Đang suy nghĩ...", cls: "bot" };
  chats[currentChat].push(thinking);
  renderMessage(thinking);
  saveChats();

  try {
    let res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    let data = await res.json();
    chats[currentChat].pop(); // bỏ tin "Đang suy nghĩ..."
    document.getElementById("messages").lastChild.remove();

    if (data.code) {
      let botMsg = { sender: botName, text: "Đây là code mình chuẩn bị cho đại ca 👇", cls: "bot" };
      chats[currentChat].push(botMsg);
      renderMessage(botMsg);
      chats[currentChat].push({ sender: botName, code: data.code });
      showCode(data.code);
    } else {
      let botMsg = { sender: botName, text: data.reply, cls: "bot" };
      chats[currentChat].push(botMsg);
      renderMessage(botMsg);
    }
    saveChats();
  } catch (err) {
    document.getElementById("messages").lastChild.remove();
    let errMsg = { sender: botName, text: "❌ Lỗi server! Không thể nhận phản hồi.", cls: "bot" };
    chats[currentChat].push(errMsg);
    renderMessage(errMsg);
    saveChats();
  }
}

// Hiện code block
function showCode(code) {
  let pre = document.createElement("pre");
  pre.className = "code-block";
  pre.textContent = code;

  let copyBtn = document.createElement("button");
  copyBtn.textContent = "📋 Sao chép";
  copyBtn.className = "copy-btn";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(code);
    copyBtn.textContent = "✅ Đã sao chép";
    setTimeout(() => copyBtn.textContent = "📋 Sao chép", 2000);
  };

  pre.appendChild(copyBtn);
  document.getElementById("messages").appendChild(pre);
  scrollToBottom();
}

// Nickname
function toggleNickname() {
  let box = document.getElementById("nicknameBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

function saveNickname() {
  botName = document.getElementById("botNickname").value;
  userName = document.getElementById("userNickname").value;
  document.getElementById("botName").innerText = botName;
  toggleNickname();
  let msg = { sender: botName, text: "👌 Biệt danh đã được cập nhật xong!", cls: "bot" };
  chats[currentChat].push(msg);
  renderMessage(msg);
  saveChats();
}

function scrollToBottom() {
  let chat = document.getElementById("messages");
  chat.scrollTop = chat.scrollHeight;
}
