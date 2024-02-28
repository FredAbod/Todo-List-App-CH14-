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

    await emailSender(email, userName, otp);

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
    return res.status(500).json({ message: "Error fetching completed ToDo list", err });
  }
};

const express = require("express");
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
    const filteredList = user.list.filter((item) => descriptionRegex.test(item.description));

    return res.status(200).json({
      message: "Filtered ToDo List by Description Successfully",
      data: filteredList.length,
      filteredList,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching filtered ToDo list", err });
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