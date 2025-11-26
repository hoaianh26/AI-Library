import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,   // ví dụ: "smtp.gmail.com"
    port: process.env.SMTP_PORT,   // ví dụ: 587
    secure: false,
    auth: {
      user: process.env.SMTP_USER, // email gửi
      pass: process.env.SMTP_PASS, // mật khẩu app / smtp
    },
  });

  await transporter.sendMail({
    from: `"AI Library" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
