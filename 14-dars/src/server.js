import express from "express";
import dotenv from "dotenv";
import { requireEnv } from "./env.js";
import { sendWithLogging } from "./mailer.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const MAIL_FROM = process.env.MAIL_FROM || `${requireEnv("GMAIL_USER")}`;

app.post("/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body || {};

  if (!to || !subject) {
    return res.status(400).json({ error: "Bad Request: to and subject are required" });
  }
  if ((!text || !String(text).trim()) && (!html || !String(html).trim())) {
    return res.status(400).json({ error: "Bad Request: text or html is required" });
  }

  try {
    const result = await sendWithLogging({
      from: MAIL_FROM,
      to,
      subject,
      text: text ? String(text) : undefined,
      html: html ? String(html) : undefined,
    });

    return res.status(200).json({
      message: "Email sent",
      ...result,
    });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({
      error: "Server error: could not send email",
    });
  }
});

app.get("/", (req, res) => res.send("Mail API ishlayapti ✅"));

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});
