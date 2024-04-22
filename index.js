const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const passport = require("passport");
const cookieSession = require("cookie-session");
const passportSetup = require('./middleware/passportSetup')
const { connectDB } = require("./config/db");
const userRouter = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const adminRouter = require('./routes/admin.routes');
const session = require("express-session");


const app = express();

// Middleware
app.use(express.json()); // Parse JSON request body
dotenv.config(); // Load environment variables
app.use(morgan("dev")); // HTTP request logger

// Set security HTTP headers with Helmet
app.use(helmet());

// Enable CORS
app.use(cors());

app.use(
  session({
    secret: "jhktoyuroyro7667er76e8",
    resave: false,
    saveUninitialized: false,
  })
);


app.use(passport.initialize());
app.use(passport.session());


// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB
const port = process.env.PORT || 3000;

/**
 * Middleware to handle rate limiting, security headers, logging, and CORS.
 */
app.use((req, res, next) => {
  // Rate limiting
  limiter(req, res, next);
});

// Routes
app.get("/", (req, res) => {
  /**
   * Home route.
   *
   * @route GET /
   * @returns {string} Welcome message
   */
  res.send("Welcome To Our TODO LIST APP");
});

/**
 * User API routes.
 */
app.use('/api/v1/user', userRouter);

/**
 * User Google API routes.
 */
app.use('/api/v1', authRoutes);

/**
 * Admin API routes.
 */
app.use('/api/v1/admin', adminRouter);

// 404 page
app.get("*", (req, res) => {
  /**
   * 404 route.
   *
   * @route GET /*
   * @returns {string} Not found message
   */
  res.status(404).json("page not found");
});

// Start server
app.listen(port, async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    /**
     * Server listening event.
     *
     * @event Server.listen
     */
    console.log("Database connection established");
    console.log(`Server is listening on http://localhost:${port}`);
  } catch (error) {
    console.log("Error connecting to MongoDB: " + error.message);
  }
});
