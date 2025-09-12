// index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// dùng cho post json
app.use(express.json());
// cho phép load file tĩnh trong /public
app.use(express.static(path.join(__dirname, "public")));

const OPENAI_KEY = process.env.OPENAI_API_KEY || ""; 

if (!OPENAI_KEY) {
  console.error("⚠️ OPENAI_API_KEY chưa được set. Hãy vào Render → Environment → Add var.");
}

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Missing message" });

    console.log("📩 Nhận tin nhắn:", message);

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Bạn là SâuGPT, một chatbot vui vẻ, ngắn gọn." },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("❌ OpenAI error:", r.status, text);
      return res.status(502).json({ error: "OpenAI error", detail: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("❌ JSON parse error:", text);
      return res.status(500).json({ error: "Invalid JSON", detail: text });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "Không có phản hồi.";
    console.log("✅ Reply:", reply);
    return res.json({ reply });
  } catch (err) {
    console.error("❌ Exception:", err);
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
