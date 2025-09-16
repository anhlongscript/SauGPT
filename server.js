import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // nếu bạn để frontend trong public/

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY || "admin099";

app.post("/api/chat", async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY không được cấu hình trên server." });
  }

  const { message = "", history = [] } = req.body;
  const incomingAdminKey = req.headers["x-admin-key"] || "";
  const includeRaw = incomingAdminKey === ADMIN_KEY;

  const systemPrompt = `Bạn là SâuGPT 🐛 — trợ lý chuyên về code (đặc biệt là Lua cho Roblox).
Luôn trả lời thân thiện, có biểu tượng cảm xúc phù hợp, xưng hô theo biệt danh người dùng nếu họ đã đặt.
Khi người dùng yêu cầu code, hãy xuất đoạn code trong khung ```lua ... ```.`;

  // messages for OpenAI: system + history + latest user
  const payloadMessages = [
    { role: "system", content: systemPrompt },
    ... (Array.isArray(history) ? history : []),
    { role: "user", content: message }
  ];

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: payloadMessages,
        temperature: 0.25,
        max_tokens: 1200
      })
    });

    const text = await resp.text();

    if (!resp.ok) {
      let err;
      try { err = JSON.parse(text); } catch { err = text; }
      if (includeRaw) console.error("OpenAI returned non-ok:", err);
      return res.status(resp.status).json({ error: err });
    }

    const data = JSON.parse(text);
    const reply = data?.choices?.[0]?.message?.content || "";

    // tìm code block ```lua ... ``` hoặc ``` ... ```
    const codeMatch = reply.match(/```(?:lua)?\n?([\s\S]*?)```/i);
    const code = codeMatch ? codeMatch[1].trim() : null;

    const result = { reply, code };
    if (includeRaw) result.raw = data;

    // server-side logging for admin
    if (includeRaw) console.log("OpenAI response (raw):", JSON.stringify(data, null, 2));

    res.json(result);
  } catch (err) {
    console.error("Server exception:", err);
    return res.status(500).json({ error: "Server exception: " + (err?.message || err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SâuGPT server chạy cổng ${PORT}`));
