import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// 👉 Dán thẳng key vào đây
const OPENAI_API_KEY = "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";

app.use(express.static("public"));
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // có thể đổi sang gpt-4o nếu muốn mạnh hơn
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "❌ Có lỗi xảy ra, thử lại nhé." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
