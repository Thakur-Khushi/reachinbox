import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";

let transporterPromise: Promise<Transporter> | null = null;

async function buildTransporter(): Promise<Transporter> {
  if (env.etherealUser && env.etherealPass) {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: env.etherealUser, pass: env.etherealPass },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  console.log("[mailer] Generated Ethereal test account:");
  console.log(`[mailer]   user: ${testAccount.user}`);
  console.log(`[mailer]   pass: ${testAccount.pass}`);
  console.log("[mailer] Set ETHEREAL_USER/ETHEREAL_PASS in .env to reuse this account.");

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = buildTransporter();
  }
  return transporterPromise;
}

export interface SendResult {
  previewUrl: string | null;
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<SendResult> {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: '"ReachInbox Scheduler" <scheduler@example.com>',
    to,
    subject,
    text: body,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  return { previewUrl };
}
