const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: "Email is required",
    },
    password: {
      type: String,
      required: "Password is required",
    },
    role: {
      type: String,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    phone: {
      type: String,
    },
    country: {
      type: String,
    },
    gender: {
      type: Number,
      enum: [0, 1],
    },
    birthday: {
      type: Date,
    },
    isActived: {
      type: Boolean,
      default: true,
    },
    isVeryfied: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "manager", "collaborator", "user"],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
