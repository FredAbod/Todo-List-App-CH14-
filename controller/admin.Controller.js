const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.Schema"); // Assuming you have a schema for Admin
const emailSender = require("../middleware/email");
const User = require("../models/user.schema");

exports.adminSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required information" });
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

    const admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    // Hashing Our Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    return res
      .status(201)
      .json({ message: "Admin saved successfully", newAdmin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error saving admin", err });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find The Admin By Email In The Database
    const admin = await Admin.findOne({ email });

    // If Admin Not Found, Return Error
    if (!admin) {
      return res.status(404).json({ message: "Admin Not Found" });
    }

    const correctPassword = await bcrypt.compare(password, admin.password);
    if (!correctPassword) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    // Generate a token
    const token = jwt.sign({ adminId: admin._id }, process.env.SECRET_KEY, {
      expiresIn: "1h", // Token expiration time
    });

    return res
      .status(200)
      .json({ message: "Admin Logged In Successfully", token, admin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error Logging In Admin", err });
  }
};

exports.allUsers = async (req, res) => {
    try {
        const id = req.user.adminId;
        const isAdmin = await Admin.findById(id);
        if (isAdmin.role !== "admin") {
            return res
            .status(400)
            .json({ message: "You Are Not Authorized"});
        }

      const allUsers = await User.find({}, { email: 1, userName: 1, _id: 0 });
  
      return res
        .status(200)
        .json({ message: "All users Fetched", data: allUsers });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error Fetching Users", err });
    }
  };
  