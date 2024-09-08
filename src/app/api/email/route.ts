import { transport } from "@/lib/mailer";

export async function GET(_: Request) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: "grgnaponte@gmail.com",
    subject: "👋 Hello from Node.js 🚀",
    text: "This is a test email sent from Node.js using nodemailer. 📧💻",
  };

  const info = await transport.sendMail(mailOptions);

  return Response.json({ info });
}
