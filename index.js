import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// Khắc phục __dirname trong ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App setup
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // phải khai báo trên Render Env
});

// API chat
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ reply: "⚠️ Thiếu message trong request" });
    }

    console.log("📩 Client gửi:", message);

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion?.choices?.[0]?.message?.content || "🤖 Không có trả lời";
    console.log("🤖 Trả lời:", reply);

    return res.json({ reply });
  } catch (err) {
    console.error("❌ ERROR /chat:", err);

    // Nếu có response từ OpenAI thì log thêm chi tiết
    if (err?.response) {
      try {
        const text = await err.response.text();
        console.error("❌ OpenAI error body:", text);
      } catch (e) {
        console.error("Không đọc được body từ OpenAI", e);
      }
    }

    return res.status(500).json({
      reply: "❌ Có lỗi xảy ra, thử lại nhé.",
      error: err.message || String(err),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SâuGPT chạy tại http://localhost:${PORT}`);
});
