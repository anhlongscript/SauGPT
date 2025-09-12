import OpenAI from "openai";
import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const upload = multer({ dest: "uploads/" });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", upload.single("image"), async (req, res) => {
  const userMessage = req.body.message;
  let content = [];

  if (userMessage) {
    content.push({ type: "text", text: userMessage });
  }
  if (req.file) {
    content.push({
      type: "image_url",
      image_url: { url: `http://localhost:3000/uploads/${req.file.filename}` }
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content }]
    });

    res.json({ reply: completion.choices[0].message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi AI" });
  }
});

app.listen(3000, () => console.log("🚀 Server chạy tại http://localhost:3000"));
