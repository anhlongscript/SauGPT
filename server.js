import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(express.static("public")); // phục vụ file frontend

app.post("/chat", async (req, res) => {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: req.body.messages
      })
    });

    if (!resp.ok) {
      const err = await resp.json();
      console.error("❌ OpenAI API error:", resp.status, err);
      return res.status(resp.status).json(err);
    }

    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Server crash:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server chạy tại cổng ${PORT}`));
