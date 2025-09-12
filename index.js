import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

app.use(express.json());
app.use(express.static("public"));

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // có thể đổi thành "gpt-3.5-turbo" nếu key của bạn không support
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API error:", errorText);
      return res.status(500).json({ reply: `OpenAI error: ${errorText}` });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ reply: `Server error: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`✅ SâuGPT server chạy ở cổng ${PORT}`);
});
