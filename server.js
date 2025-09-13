import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// quick health
app.get("/health", (req, res) => {
  res.json({ ok: true, envKeySet: !!process.env.OPENAI_API_KEY });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body?.message;
    if (!message) return res.status(400).json({ error: "Missing message" });

    if (!process.env.OPENAI_API_KEY) {
      console.error("NO OPENAI KEY IN ENV");
      return res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
    }

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Bạn là Sâu🐛GPT, trả lời rõ ràng, thân thiện, bằng tiếng Việt." },
          { role: "user", content: message },
        ],
        max_tokens: 1200,
      }),
    });

    const data = await openaiResp.json();
    // Log response for debug (do not log full key)
    if (!openaiResp.ok) {
      console.error("OpenAI API returned non-OK:", openaiResp.status, data);
      return res.status(openaiResp.status).json({ error: data.error?.message || "OpenAI error", raw: data });
    }

    // Support either format
    const reply = data?.choices?.[0]?.message?.content ?? data?.reply ?? null;
    if (!reply) {
      console.error("No reply found in OpenAI response:", data);
      return res.status(500).json({ error: "No reply from AI", raw: data });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Server error /chat:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log("OPENAI key present in env:", !!process.env.OPENAI_API_KEY);
});
