const express = require("express");
const OpenAI = require("openai");
const app = express();

const PORT = process.env.PORT || 3000;

// middleware để parse JSON
app.use(express.json());

// tạo client OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // lấy từ Render Environment Variable
});

// route mặc định
app.get("/", (req, res) => {
  res.send("Xin chào từ sâu gpt 🚀");
});

// route chat
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi gọi OpenAI API" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy ở cổng ${PORT}`);
});
