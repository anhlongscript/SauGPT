import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ reply: "Lỗi AI 😢" });
  }
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
