const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const validate= require("../middleware/validation");
const { isAuthenticated } = require("../middleware/auth");
const { registerRequestSchema, loginRequestSchema } = require("../zod-schemas");

router.post(
  "/register",
  validate({ body: registerRequestSchema }),
  authController.register
);

router.post(
  "/login",
  validate({ body: loginRequestSchema }),
  authController.login
);

router.post("/logout", isAuthenticated, authController.logout);

//get profile
router.get("/me", isAuthenticated, authController.getCurrentUser);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google`,
    successRedirect: `${process.env.FRONTEND_URL}/dashboard`,
  })
);

module.exports = router;
