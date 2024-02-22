const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const User = require("../models/user.schema");
const emailSender = require("../middleware/email");



exports.signup = async (req, res) => {
  try {
    const { userName, password, email } = req.body;

    if (!userName || !password || !email) {
      return res
        .status(400)
        .json({ message: "Please provide username, password, and email" });
    }

    // Password validation: Must contain at least one uppercase, one lowercase, one number, and one special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    // const otp =  otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, Digits: true });
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Hashing Our Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      userName,
      password: hashedPassword,
      email,
      otp: otp,
    });

    await newUser.save();

    await emailSender(email, userName)

    return res
      .status(201)
      .json({ message: "User saved successfully", newUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error saving user", err });
  }
};

exports.login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res
        .status(400)
        .json({ message: "Please input your username and password" });
    }

    // Find The User By Email In The Database
    const user = await User.findOne({ userName });

    // If You're Not A User, Sign Up
    if (!user) {
      return res.status(404).json({ message: "User Not Found, Please Signup" });
    }

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    // Generate a token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h", // Token expiration time
    });

    return res
      .status(200)
      .json({ message: "User Logged In Succesfully", token: token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error Logging In User", err });
  }
};

exports.addList = async (req, res) => {
  try {
    const id = req.params.id;
    const { description } = req.body;
    if (!description) {
      return res
        .status(400)
        .json({ message: "Please input Description For Your List" });
    }
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    user.list.push({ description: description });

    await user.save();
    return res
      .status(200)
      .json({ message: "Todo List Saved Successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error Saving List", err });
  }
};
