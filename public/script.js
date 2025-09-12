const chatBox = document.getElementById("chat-box");
const fileUpload = document.getElementById("file-upload");

function sendMessage() {
  const input = document.getElementById("user-input");
  const msg = input.value.trim();
  if (!msg) return;

  addMessage(msg, "user");
  input.value = "";

  // Bot trả lời sau 1s
  setTimeout(() => {
    addMessage("Xin chào! Tôi là 🐛 SâuGPT đây.", "bot");
  }, 1000);
}

function addMessage(text, type) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", type);
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgDiv;
}

// Upload ảnh
fileUpload.addEventListener("change", () => {
  const file = fileUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxWidth = "200px";
      img.style.borderRadius = "8px";
      addMessage("", "user").appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});
