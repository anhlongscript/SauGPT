import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // nơi chứa index.html, script.js, style.css

// ✅ API CHAT
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Gọi OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là 🐛 SâuGPT — một chuyên gia lập trình, đặc biệt giỏi về code Lua cho Roblox. Luôn trả lời chi tiết, dễ hiểu, kèm code khi cần."
          },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(500).json({ error: errorData });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Lỗi server!" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
