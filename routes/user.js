const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const {saveRedirectUrl}=require("../middleware.js");
const UserControler=require("../controllers/user.js");

router
  .route("/signup")
  .get(UserControler.RenderSignUpForm)
  .post(wrapAsync(UserControler.SignUp));

router
  .route("/login")
  .get(UserControler.RenderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    UserControler.Login
  );

router.get("/logout",UserControler.LogOut)

module.exports = router;
