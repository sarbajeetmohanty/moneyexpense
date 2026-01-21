import express from "express";

const app = express();
app.use(express.json({ limit: "5mb" })); // receipts/photos can be base64

// 1) Put your Apps Script /exec URL here
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwR7jR900p8YELjWF3AIYLyyxqwRFBfX5VPemmO9qGZDBTOYCspWjTr_Z32tWKTMAE/exec";

// 2) Serve your frontend (index.html in /public)
app.use(express.static("public", { extensions: ["html"] }));

// 3) Proxy endpoint: browser -> Render (/api) -> Apps Script
app.post("/api", async (req, res) => {
  try {
    const r = await fetch(GAS_URL, {
      method: "POST",
      // IMPORTANT for Apps Script: text/plain avoids preflight/CORS issues on the server side too
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(req.body || {})
    });

    const text = await r.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Health check
app.get("/health", (_req, res) => res.status(200).send("ok"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on", port));
