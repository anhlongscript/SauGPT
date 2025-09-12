import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // phục vụ file frontend

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // nhớ set API key
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo", // hoặc gpt-4
      messages: [{ role: "user", content: message }],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "❌ Lỗi: OpenAI error" });
  }
});

app.listen(3000, () => {
  console.log("✅ Server chạy tại http://localhost:3000");
});
