import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

// API chat route
app.post("/chat", async (req, res) => {
  try {
    const { message, image } = req.body;

    // gọi OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Bạn là Sâu🐛GPT, trả lời thân thiện, có chút hài hước." },
          { role: "user", content: message },
          ...(image ? [{ role: "user", content: `Ảnh người dùng gửi: ${image}` }] : [])
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.json({ reply: "❌ Lỗi: " + data.error.message });
    }

    const reply = data.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "❌ Lỗi: Server không phản hồi." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Sâu🐛GPT chạy tại cổng ${PORT}`);
});