const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: {
      type: String,
      enum: {
        values: ["customer", "owner", "manager"],
        message: "{VALUE} is not a valid role",
      },
      default: "customer",
    },
    profile: {
      fullName: { type: String, default: "", maxlength: 100 },
      contactNumber: {
        type: String,
        default: "",
        match: [/^[0-9]{10,15}$/, "Invalid phone number"],
      },
      addresses: [
        {
          title: { type: String, required: true }, // e.g. Home, Work
          address: { type: String, required: true, maxlength: 200 },
          city: { type: String, required: true, maxlength: 100 },
          state: { type: String, required: true, maxlength: 100 },
          country: { type: String, default: "India", maxlength: 100 },
          pinCode: {
            type: String,
            required: true,
            match: [/^[0-9]{5,10}$/, "Invalid ZIP code"],
          },
          contactNumber: {
            type: String,
            required: true,
            match: [/^[0-9]{10,15}$/, "Invalid phone number"],
          }
        }
      ],
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare incoming password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 mins)
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate and hash email verification token
userSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Set expire (24 hours)
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
