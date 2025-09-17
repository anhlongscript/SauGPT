let mode = null;

function setMode(selected) {
  mode = selected;
  document.getElementById("mode-select").classList.add("hidden");
  document.getElementById("chat-container").classList.remove("hidden");
}

function addMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = "message " + (sender === "Bạn" ? "user" : "bot");

  // check nếu có code block
  if (text.includes("```")) {
    const parts = text.split(/```/);
    msg.innerHTML = `<b>${sender}:</b><br>` + parts.map((p, i) =>
      i % 2 === 1
        ? `<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><pre>${p}</pre></div>`
        : p
    ).join("");
  } else {
    msg.innerHTML = `<b>${sender}:</b> ${text}`;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;
  addMessage("Bạn", text);
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, mode })
    });
    const data = await res.json();
    addMessage("SâuGPT", data.reply || "❌ Lỗi server!");
  } catch {
    addMessage("SâuGPT", "❌ Lỗi kết nối server!");
  }
}

function copyCode(btn) {
  const code = btn.nextElementSibling.innerText;
  navigator.clipboard.writeText(code);
  btn.innerText = "Đã copy!";
  setTimeout(() => btn.innerText = "Copy", 1500);
}

async function viewLogs() {
  const key = document.getElementById("admin-key").value;
  const output = document.getElementById("logs-output");
  try {
    const res = await fetch("/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });
    const data = await res.json();
    if (data.logs) {
      output.textContent = JSON.stringify(data.logs, null, 2);
    } else {
      output.textContent = "❌ Sai key!";
    }
  } catch {
    output.textContent = "❌ Lỗi kết nối server!";
  }
}
