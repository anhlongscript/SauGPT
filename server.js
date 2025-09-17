import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// setup static
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ADMIN_KEY = "admin0999";

// store logs
let logs = [];

// API chat
app.post("/chat", async (req, res) => {
  const { message, mode } = req.body;
  if (!message) return res.status(400).json({ error: "Thiếu message!" });

  try {
    const systemPrompt =
      mode === "genz"
        ? "Bạn là SâuGPT 🐛 GenZ, trả lời kiểu cà khịa, hài hước, meme, ngắn gọn."
        : "Bạn là SâuGPT 🐛 Coder, chuyên về code (ưu tiên Lua cho Roblox nhưng hiểu nhiều ngôn ngữ khác). Luôn trả lời với code trong ```...``` nếu có.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "❌ Lỗi server!";
    logs.push({ user: message, bot: reply, mode, time: new Date() });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server lỗi!" });
  }
});

// admin logs
app.post("/admin", (req, res) => {
  const { key } = req.body;
  if (key === ADMIN_KEY) {
    return res.json({ logs });
  }
  return res.status(403).json({ error: "Sai key!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại cổng ${PORT}`);
});
