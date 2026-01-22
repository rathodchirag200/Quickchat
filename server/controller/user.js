const User = require("../model/user");
const bcrypt = require("bcrypt");
const { Sendmail, Genrateotp } = require("../config/sendmail");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const Register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const image = req.file?.path;

    if (!username || !email || !password || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }


    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Genrateotp();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpiration: new Date(Date.now() + 5 * 60 * 1000),
      image: image,g
    });

    await newUser.save();
    await Sendmail(email, otp);

    const token = jwt.sign({ id: newUser._id }, process.env.jwt_secret, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Registration successful. OTP sent to email",
      userId: newUser._id,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otp) {
      return res
        .status(200)
        .json({ success: false, message: "otp is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiration < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.otp = null;
    user.otpExpiration = null;
    user.isVerified = true;

    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.jwt_secret, {
      expiresIn: "7d",
    });

    console.log(process.env.jwt_secret);

    return res.status(200).json({
      success: true,
      message: "User login successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const displayuser = async (req, res) => {
  try {
    const data = await User.find();
    return res.status(200).json({ sucess: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getme = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const resendotp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Genrateotp();
    const otpExpiration = new Date(Date.now() + 2 * 60 * 1000);

    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    await Sendmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Genrateotp();
    const otpExpiration = new Date(Date.now() + 2 * 60 * 1000);

    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    await Sendmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const changepassword = async (req, res) => {
  try {
    const userid = req.user._id;

    const { oldpassword, newpassword, confirmpassword } = req.body;
    console.log(req.body, "body");

    if (!oldpassword || !newpassword || !confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    if (newpassword !== confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password must match",
      });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const editprofile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, email, about } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = { username, email, about };

    if (req.file) {
      updateData.image = req.file.path; // Cloudinary URL
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Edit profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const googleLogin = async (req, res) => {
  try {
    const { username, email, image, firebaseUID } = req.body;

    if (!email || !firebaseUID) {
      return res.status(400).json({ message: "Invalid Google data" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username,
        email,
        image,
        firebaseUID,
        provider: "google",
        isVerified: true,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.jwt_secret, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Google login success",
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  Register,
  Login,
  displayuser,
  getme,
  verifyOtp,
  resendotp,
  forgotpassword,
  editprofile,
  changepassword,
  googleLogin,
};
