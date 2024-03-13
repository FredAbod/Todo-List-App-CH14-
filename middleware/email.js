const nodemailer = require("nodemailer");

const emailSender = async (email, userName, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_USER,
      pass: process.env.GOOGLE_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GOOGLE_USER,
    to: email,
    subject: "Welcome To TodoList App",
    text: `Welcome ${userName} to TodoList
      You're highly welcomed. This is your otp: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};
const emailSenderTemplate = async (msg, subject, receiver) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GOOGLE_USER,
      to: receiver,
      subject: subject,
      html: msg,
    };

    await transporter.sendMail(mailOptions);

    return `Message sent' `;
  } catch (err) {
    console.log(err);
    return new customError(500, "Server Error");
  }
};

module.exports = { emailSender, emailSenderTemplate };
