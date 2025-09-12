import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Xin chào từ SâuGPT 🚀 (ES Module)");
});

app.listen(PORT, () => {
  console.log(`✅ SâuGPT chạy ở cổng ${PORT}`);
});
