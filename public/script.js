document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("user-input").value;
  document.getElementById("chat-box").innerHTML += `<p><b>Bạn:</b> ${input}</p>`;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input })
  });

  const data = await res.json();
  document.getElementById("chat-box").innerHTML += `<p><b>SâuGPT:</b> ${data.reply}</p>`;
});
