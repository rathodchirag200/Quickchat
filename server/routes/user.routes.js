const express = require("express");
const upload = require("../middelwear/uploads");
const router = express.Router();
const {
  Register,
  Login,
  displayuser,
  getme,
  verifyOtp,
  resendotp,
  editprofile,
  changepassword,
  googleLogin,
} = require("../controller/user");
const auth = require("../middelwear/auth");

router.post("/register", upload.single("image"), Register);
router.post("/login", Login);
router.get("/users", displayuser);
router.get("/getme", auth, getme);
router.post("/verify", verifyOtp);
router.post("/resend", resendotp);
router.post("/edit", auth, upload.single("image"), editprofile);
router.post("/changepassword", auth, changepassword);
router.post("/google-login", googleLogin);

module.exports = router;
