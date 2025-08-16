const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const transporter = require("../utils/mailer");

exports.getLogin = (req, res) => {
  const message = req.query.message; // Capture success message from query params (e.g., after password reset)
  res.render("admin-login", { message });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render("admin-login", { error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.render("admin-login", { error: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin/login");
};

exports.getForgotPassword = (req, res) => {
  res.render("forgot-password");
};

exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: "Password Reset",
        text: `You are receiving this because you (or someone else) have requested a password reset.\n\n
        Please click this link to reset your password:\n\n
        http://${req.headers.host}/admin/reset-password/${token}\n\n
        If you did not request this, please ignore this email.`,
      };
      await transporter.sendMail(mailOptions);
    }
    res.render("forgot-password", {
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    res.render("forgot-password", { error: "Server error" });
  }
};

exports.getResetPassword = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.render("forgot-password", {
        error:
          "Invalid or expired reset token. Please request a new reset link.",
      });
    }
    res.render("reset-password", { token });
  } catch (err) {
    res.render("forgot-password", { error: "Server error" });
  }
};

exports.postResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render("reset-password", {
      token,
      error: "Passwords do not match.",
    });
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.render("forgot-password", {
        error:
          "Invalid or expired reset token. Please request a new reset link.",
      });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.redirect("/admin/login?message=Password reset successfully");
  } catch (err) {
    res.render("reset-password", { token, error: "Server error" });
  }
};