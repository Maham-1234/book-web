const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.scope("withPassword").findOne({
          where: { email },
        });

        if (!user || user.provider !== "local") {
          return done(null, false, { message: "Invalid email or password." });
        }

        if (!user.is_active) {
          return done(null, false, {
            message: "This account has been deactivated.",
          });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { google_id: profile.id } });

        if (user) {
          return done(null, user);
        }

        const email = profile.emails[0].value;
        user = await User.findOne({ where: { email } });

        if (user) {
          user.google_id = profile.id;
          user.provider = "google";
          await user.save();
          return done(null, user);
        }

        const newUser = await User.create({
          google_id: profile.id,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          email: email,
          password: null,
          provider: "google",
          is_email_verified: true,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
