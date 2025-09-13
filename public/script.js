const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const imgUpload = document.getElementById("image-upload");

// Các câu trả lời mẫu
const botReplies = [
  "Xin chào! Tôi là 🐛 SâuGPT.",
  "Bạn cần gì vậy?",
  "Hôm nay bạn thế nào?",
  "Mình có thể giúp gì cho bạn?",
  "Nghe hay đó, kể thêm đi!",
  "Hehe, bạn vui tính ghê 😆"
];

// Thêm tin nhắn vào khung chat
function addMessage(text, sender, isImage = false) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  if (isImage) {
    const img = document.createElement("img");
    img.src = text;
    img.style.maxWidth = "200px";
    msg.appendChild(img);
  } else {
    msg.innerText = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Bot trả lời (rule-based + random)
function getBotReply(userMsg) {
  const msg = userMsg.toLowerCase();

  if (msg.includes("chào")) return "Chào bạn 👋, mình là SâuGPT 🐛";
  if (msg.includes("tên")) return "Mình tên là 🐛 SâuGPT cute phô mai que";
  if (msg.includes("buồn")) return "Đừng buồn nữa, có mình ở đây mà 💚";

  return botReplies[Math.floor(Math.random() * botReplies.length)];
}

function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;

  addMessage(msg, "user");
  userInput.value = "";

  setTimeout(() => {
    const reply = getBotReply(msg);
    addMessage(reply, "bot");
  }, 800);
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Gửi ảnh
imgUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    addMessage(reader.result, "user", true);

    setTimeout(() => {
      addMessage("Ảnh đẹp đó 📸!", "bot");
    }, 800);
  };
  reader.readAsDataURL(file);
});
