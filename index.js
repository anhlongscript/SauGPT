import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// khởi tạo openai
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API nhận tin nhắn từ frontend
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "❌ Có lỗi xảy ra, thử lại nhé." });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại cổng ${PORT}`);
});
