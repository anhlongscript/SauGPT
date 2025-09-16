import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;

app.use(bodyParser.json());
app.use(express.static("public")); // để load index.html, style.css, script.js

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    // Prompt hệ thống (đã fix lỗi cú pháp)
    const systemPrompt = `Bạn là SâuGPT 🐛 — trợ lý chuyên về code (đặc biệt là Lua cho Roblox).
Luôn trả lời thân thiện, có biểu tượng cảm xúc phù hợp, xưng hô theo biệt danh người dùng nếu họ đã đặt.
Khi người dùng yêu cầu code, hãy xuất đoạn code trong khung \`\`\`lua ... \`\`\``;

    // Định dạng messages gửi OpenAI
    const payloadMessages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // model nhẹ, nhanh
        messages: payloadMessages
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: `❌ Lỗi: ${data.error.message}` });
    }

    const reply = data.choices?.[0]?.message?.content || "❌ Không có phản hồi!";
    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ reply: "❌ Lỗi server!" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SâuGPT chạy ở http://localhost:${PORT}`);
});
