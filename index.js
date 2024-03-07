const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const morgan = require("morgan");
const { connectDB } = require("./config/db");
const userRouter = require('./routes/user.routes')
const adminRouter = require('./routes/admin.routes')


const app = express();
app.use(express.json());
dotenv.config();
app.use(morgan("dev"));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Welcome To Our TODO LIST APP");
});

app.use('/api/v1/user', userRouter)
app.use('/api/v1/admin', adminRouter)

// @404 page
app.get("*", (req, res) => {
    res.status(404).json("page not found");
  });

app.listen(port, async () => {
    try {
      await connectDB(process.env.MONGODB_URL);
      console.log("Database connection established");
      console.log(`Server is listening on http://localhost:${port}`);
    } catch (error) {
      console.log("Error connecting to MongoDB: " + error.message);
    }
  });
  