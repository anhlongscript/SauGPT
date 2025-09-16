let botName = "SâuGPT đẹp trai số 1 thế giới";
let userName = "Đại ca";

function sendMsg() {
  let input = document.getElementById("userInput");
  let text = input.value.trim();
  if (!text) return;

  addMessage(userName, text, "user");

  // Bot trả lời
  if (text.toLowerCase().includes("code roblox")) {
    botReply("Đây là đoạn code Lua Roblox cho bạn:");
    showCode(`local Player = game.Players.LocalPlayer
local Character = Player.Character or Player.CharacterAdded:Wait()
local Humanoid = Character:WaitForChild("Humanoid")

print("Xin chào từ SâuGPT!")`);
  } else {
    botReply("Xin chào! Bạn cần trợ giúp gì với lập trình hay Lua Roblox?");
  }

  input.value = "";
}

function addMessage(sender, text, cls) {
  let msgBox = document.createElement("div");
  msgBox.className = "msg";
  msgBox.innerHTML = `<span class="${cls}">${sender}:</span> ${text}`;
  document.getElementById("messages").appendChild(msgBox);
  scrollToBottom();
}

function botReply(text) {
  addMessage(botName, text, "bot");
}

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

function toggleNickname() {
  let box = document.getElementById("nicknameBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

function saveNickname() {
  botName = document.getElementById("botNickname").value;
  userName = document.getElementById("userNickname").value;
  document.getElementById("botName").innerText = botName;
  toggleNickname();
  botReply("Biệt danh đã được cập nhật thành công 👌");
}

function scrollToBottom() {
  let chat = document.getElementById("messages");
  chat.scrollTop = chat.scrollHeight;
}
