import nodemailer from "nodemailer";

export async function sendEmail(
  toEmail: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; simulated: boolean; message: string }> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";
  const sender = process.env.SENDER_EMAIL || user || "proctorai@ssit.edu";

  const isSmtpConfigured = !!(host && user && pass);

  if (isSmtpConfigured) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    });

    await transporter.sendMail({
      from: `"ProctorAI - SSIT" <${sender}>`,
      to: toEmail,
      subject,
      html: htmlBody
    });

    return {
      success: true,
      simulated: false,
      message: `Email successfully dispatched to ${toEmail} via ${host}.`
    };
  } else {
    return {
      success: true,
      simulated: true,
      message: `SMTP not configured. Email to ${toEmail} simulated successfully.`
    };
  }
}
