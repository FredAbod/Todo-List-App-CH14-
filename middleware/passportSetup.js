const passport = require("passport");
const dotenv = require("dotenv");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.schema");

dotenv.config();

/**
 * Serialize user object to session.
 *
 * @param {Object} user User object to serialize.
 * @param {Function} done Callback function.
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user object from session.
 *
 * @param {string} id User ID from session.
 * @param {Function} done Callback function.
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/**
 * Configure Google OAuth2.0 strategy for passport.
 */
passport.use(
  new GoogleStrategy(
    {
      callbackURL: "http://localhost:4500/api/v1/auth/google/redirect",
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      passReqToCallback: true,
    },
    /**
     * Callback function for Google OAuth2.0 strategy.
     *
     * @param {string} req The request object.
     * @param {string} accessToken Access token provided by Google.
     * @param {string} refreshToken Refresh token provided by Google.
     * @param {Object} profile User profile data from Google.
     * @param {Function} done Callback function.
     */
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = await new User({
          userName: profile.displayName,
          googleId: profile.id,
        }).save();

        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

