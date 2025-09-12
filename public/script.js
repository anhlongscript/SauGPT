const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const imageInput = document.getElementById("image-input");

async function sendMessage() {
  const message = userInput.value.trim();
  const file = imageInput.files[0];
  let base64Image = null;

  if (!message && !file) return;

  // hiển thị tin nhắn user
  if (message) appendMessage("Bạn", message, "user");
  if (file) {
    base64Image = await toBase64(file);
    appendMessage("Bạn", `<img src="${base64Image}" width="150">`, "user");
  }

  userInput.value = "";
  imageInput.value = "";

  // hiển thị hiệu ứng "typing"
  const typingDiv = document.createElement("div");
  typingDiv.className = "typing bot";
  typingDiv.innerHTML = "<span></span><span></span><span></span>";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // gửi request tới server
  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, image: base64Image })
  });

  const data = await res.json();

  typingDiv.remove();
  typeWriter("Sâu🐛GPT", data.reply, "bot");
}

function appendMessage(sender, text, cls) {
  const div = document.createElement("div");
  div.className = "message " + cls;
  div.innerHTML = `<b>${sender}:</b> ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function typeWriter(sender, text, cls) {
  let i = 0;
  const div = document.createElement("div");
  div.className = "message " + cls;
  chatBox.appendChild(div);

  function typing() {
    if (i < text.length) {
      div.innerHTML = `<b>${sender}:</b> ` + text.substring(0, i+1);
      i++;
      chatBox.scrollTop = chatBox.scrollHeight;
      setTimeout(typing, 30);
    }
  }
  typing();
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}