const nodemailer = require("nodemailer");

const Sendmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "chiragsidev@gmail.com",
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Quick Chat" <chiragsidev@gmail.com>`,
      to: email,
      subject: "Your OTP Code",
      html: `<h2>Your OTP is ${otp}</h2>`,
    });

  } catch (error) {
    console.error("Email send error:", error);
  }
};

const Genrateotp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = { Sendmail, Genrateotp };
