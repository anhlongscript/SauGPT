const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function newChat() {
  chatEl.innerHTML = "";
}

function appendMessage(text, who = "bot") {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  // code block detection
  if (text.includes("```")) {
    // remove fence and render code + copy button
    const code = text.replace(/```[a-zA-Z]*\n?|```/g, "");
    const pre = document.createElement("pre");
    const codeEl = document.createElement("code");
    codeEl.textContent = code;
    pre.appendChild(codeEl);

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "📋 Copy";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = "✅ Copied";
        setTimeout(()=> copyBtn.textContent = "📋 Copy",1500);
      });
    };

    div.appendChild(copyBtn);
    div.appendChild(pre);
  } else {
    div.textContent = (who === "bot" ? "Sâu🐛GPT: " : "Bạn: ") + text;
  }
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function sendMessage() {
  const message = inputEl.value.trim();
  if (!message) return;
  appendMessage(message, "user");
  inputEl.value = "";
  // show typing indicator
  const typing = document.createElement("div");
  typing.className = "msg bot";
  typing.textContent = "Sâu🐛GPT đang suy nghĩ...";
  chatEl.appendChild(typing);
  chatEl.scrollTop = chatEl.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    typing.remove();

    if (res.ok) {
      // response from server: { reply: "..." }
      const reply = data.reply ?? (data.choices?.[0]?.message?.content) ?? JSON.stringify(data);
      appendMessage(reply, "bot");
    } else {
      // server responded non-200, show detailed error if present
      const errMsg = data?.error || data?.raw?.error?.message || JSON.stringify(data);
      appendMessage(`⚠️ Lỗi server: ${errMsg}`, "bot");
    }
  } catch (err) {
    typing.remove();
    appendMessage(`⚠️ Kết nối thất bại: ${err.message}`, "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });
