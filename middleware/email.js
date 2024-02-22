const nodemailer = require("nodemailer");

const emailSender = async (email, userName) => {
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
      subject: 'Welcome To TodoList App',
      text: `Welcome ${userName} to TodoList
      You're highly welcomed`
  
    }
  
    await transporter.sendMail(mailOptions)
  };

  module.exports = emailSender;