const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
dotenv.config();

// Determine the branch name based on NODE_ENV
const branchEnvFile =
  process.env.NODE_ENV === "production" ? ".env.main" : ".env.development";
dotenv.config({ path: branchEnvFile });

const User = require("../resources/user/models/users");

passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
      done(null, user);
    });
  });
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENTID,
        clientSecret: process.env.CLIENTSECRET,
        callbackURL: 'https://hackthejobs-staging-staging.up.railway.app/auth/google/redirect',
        passReqToCallback: true, // Add this line
      },
      async (req, accessToken, refreshToken, profile, done) => {
   
        const { id, name } = profile; 
        const firstName = name.givenName;
        const lastName = name.familyName;
  
        try {
          let existingUser = await User.findOne({ googleId: id });
  
          if (existingUser) {
            // If user exists, just log them in
            req.login(existingUser, (err) => {
              if (err) {
                return done(err);
              }
              done(null, existingUser);
            });
          } else {
            // If user doesn't exist, create a new user and log them in
            const newUser = new User({
              googleId: id,
              firstName,
              lastName,
            });
  
            await newUser.save();
            existingUser = await User.findOne({ googleId: id }); // Retrieve the newly created user
  
            req.login(existingUser, (err) => {
              if (err) {
                return done(err);
              }
              done(null, existingUser);
            });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  
