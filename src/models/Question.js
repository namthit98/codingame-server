const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      require: "Code is required"
    },
    title: {
      type: String,
      required: "Title is required",
    },
    difficult: {
      type: String,
      required: "Difficult is required",
    },
    language: {
      type: String,
      required: "Language is required",
    },
    description: {
      type: String,
      required: "Description is required",
    },
    coding: {
      type: String,
      required: "Coding is required",
    },
    testing: {
      type: String,
      required: "Testing is required",
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
