import nodemailer from "nodemailer";
import { requireEnv } from "./env.js";

const GMAIL_USER = requireEnv("GMAIL_USER");
const GMAIL_PASS = requireEnv("GMAIL_PASS");

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

export async function sendWithLogging({ to, subject, text, html, from }) {
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  console.log("messageId:", info.messageId);
  console.log("accepted:", info.accepted);
  console.log("rejected:", info.rejected);

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
}
