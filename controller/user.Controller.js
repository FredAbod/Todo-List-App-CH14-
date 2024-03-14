const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const path = require("path");
const cloudinary = require("../public/image/cloudinary");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const User = require("../models/user.schema");
// const emailSender = require("../middleware/email");

exports.signup = async (req, res) => {
  try {
    const { userName, password, email } = req.body;

    if (!userName || !password || !email) {
      return res
        .status(400)
        .json({ message: "Please provide userName, password, and email" });
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

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpCreationTime = Date.now(); // Store the creation time of OTP

    // Hashing Our Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      userName,
      password: hashedPassword,
      email,
      otp: otp,
      otpCreatedAt: otpCreationTime, // Store the creation time of OTP
    });

    await newUser.save();

    // Send email with OTP
    await ejs.renderFile(
      path.join(__dirname, "../public/Email/signUp.ejs"),
      {
        title: `Hello ${userName},`,
        body: "Welcome",
        userName: userName,
        otp: otp,
      },
      async (err, data) => {
        await emailSenderTemplate(data, "Welcome to Todo List App!", email);
      }
    );

    return res
      .status(201)
      .json({ message: "User saved successfully", newUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error saving user", err });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const otp = req.query.otp;

    if (!otp) {
      return res.status(400).json({ message: "Please Input Your Otp" });
    }

    const user = await User.findOne({ otp: otp });

    if (!user) {
      return res.status(400).json({ message: "User With That OTP Not Found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid Otp" });
    }

    // Check if OTP has expired
    const otpCreationTime = user.otpCreatedAt;
    const currentTime = Date.now();
    const otpValidityPeriod = 1 * 60 * 1000; // 1 minutes in milliseconds

    if (currentTime - otpCreationTime > otpValidityPeriod) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = null;

    await user.save();

    return res.status(200).json({ message: "OTP Verified Successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error Verifying Otp", err });
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
    if (user.isVerified == "false") {
      return res
        .status(404)
        .json({ message: "User Not Verified, Please Check Your Mail" });
    }

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    // Generate a token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h", // Token expiration time
    });

    await ejs.renderFile(
      path.join(__dirname, "../public/Email/login.ejs"),
      {
        title: `Hello ${userName},`,
        body: "You Just Logged In",
        userName: userName,
      },
      async (err, data) => {
        await emailSenderTemplate(data, "Login Succesfull!", user.email);
      }
    );

    return res
      .status(200)
      .json({ message: "User Logged In Succesfully", token: token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error Logging In User", err });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User with that email not found" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpCreationTime = Date.now(); // Store the creation time of OTP

    // Update user with new OTP and creation time
    user.otp = otp;
    user.otpCreatedAt = otpCreationTime;
    user.isVerified = false; // Reset verification status

    await user.save();

    // Send email with new OTP
    await ejs.renderFile(
      path.join(__dirname, "../public/Email/resendOtp.ejs"),
      {
        title: `Hello ${user.userName},`,
        body: "Welcome",
        userName: user.userName,
        otp: otp,
      },
      async (err, data) => {
        await emailSenderTemplate(data, "Resent OTP for Todo List App", email);
      }
    );

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error resending OTP", err });
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

exports.updateListDescription = async (req, res) => {
  try {
    const userId = req.params.id;
    const listId = req.params.listId;
    const { newDescription } = req.body;

    if (!newDescription) {
      return res.status(400).json({
        message: "Please provide a new description for your list item",
      });
    }

    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const listItem = user.list.id(listId);
    if (!listItem) {
      return res.status(404).json({ message: "List Item Not Found" });
    }

    listItem.description = newDescription;

    await user.save();
    return res
      .status(200)
      .json({ message: "List Item Description Updated Successfully", user });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error updating list item description", err });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    const id = req.params.id;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ message: "Please provide your new email" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    user.email = newEmail;

    await user.save();

    return res
      .status(200)
      .json({ message: "Email Updated Successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating email", err });
  }
};

exports.completedToDo = async (req, res) => {
  try {
    const userId = req.params.id;
    const listId = req.params.listId;
    console.log("completed");
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const completedList = user.list.id(listId);
    if (!completedList) {
      return res.status(404).json({ message: "List Item Not Found" });
    }

    completedList.completed = true;

    await user.save();
    return res.status(200).json({
      message: "YHeeehhh You have Completed Your Todos Successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error updating list item description", err });
  }
};

exports.getAllList = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const allList = user.list;
    return res.status(200).json({
      message: "All ToDo List Fetched Successfully",
      data: allList.length,
      allList,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error updating list item description", err });
  }
};

exports.getAllListAndPaginate = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const allList = user.list.slice(startIndex, endIndex);

    return res.status(200).json({
      message: "All ToDo List Fetched Successfully",
      data: {
        totalItems: user.list.length,
        currentPage: page,
        pageSize: pageSize,
        totalPages: Math.ceil(user.list.length / pageSize),
        currentItems: allList.length,
        items: allList,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching ToDo list", err });
  }
};

exports.completedToDoList = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const completedList = user.list.filter((item) => item.completed === true);

    return res.status(200).json({
      message: "Completed ToDo List Fetched Successfully",
      data: completedList.length,
      completedList,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error fetching completed ToDo list", err });
  }
};

const express = require("express");
const { emailSenderTemplate } = require("../middleware/email");
const router = express.Router();

exports.filterByDescription = async (req, res) => {
  try {
    const userId = req.params.id;
    const pattern = req.query.pattern;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const descriptionRegex = new RegExp(pattern, "i");
    const filteredList = user.list.filter((item) =>
      descriptionRegex.test(item.description)
    );

    return res.status(200).json({
      message: "Filtered ToDo List by Description Successfully",
      data: filteredList.length,
      filteredList,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error fetching filtered ToDo list", err });
  }
};

// exports.filterByDate = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const pattern = req.query.pattern;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User Not Found" });
//     }

//     const dateRegex = new RegExp(pattern, "i");
//     const filteredList = user.list.filter((item) => dateRegex.test(item.date));

//     return res.status(200).json({
//       message: "Filtered ToDo List by Date Successfully",
//       data: filteredList.length,
//       filteredList,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching filtered ToDo list", err });
//   }
// };

//upload Profile Picture
exports.uploadPicture = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return errorResMsg(res, 400, "User not found");
    }
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const updatedUser = await User.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      { profilePic: result.secure_url },
      {
        isNew: true,
      }
    );

    return res
      .status(200)
      .json({
        message: "Profile Pictur Saved Successfully",
        data: updatedUser,
      });
  } catch (err) {
    // console.log(error);
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error Uploading Profile Picture", err });
  }
};
