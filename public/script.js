async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  // gọi API backend (server.js)
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    addMessage(data.reply, "bot");
  } catch (err) {
    addMessage("⚠️ API Key sai hoặc server lỗi.", "bot");
  }
}

function addMessage(text, sender) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  // Nếu là code block thì render kèm nút copy
  if (text.includes("```")) {
    const codeContent = text.replace(/```[a-zA-Z]*\n?|\n```/g, "");
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.innerText = codeContent;
    pre.appendChild(code);

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "📋 Copy";
    copyBtn.classList.add("copy-btn");
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(code.innerText);
      copyBtn.innerText = "✅ Copied";
      setTimeout(() => (copyBtn.innerText = "📋 Copy"), 2000);
    };

    msg.appendChild(copyBtn);
    msg.appendChild(pre);
  } else {
    msg.innerText = text;
  }

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// Gửi ảnh
document.getElementById("image-btn").addEventListener("click", () => {
  document.getElementById("image-input").click();
});

document.getElementById("image-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    addMessage("📷 Ảnh đã gửi: " + file.name, "user");
  }
});
