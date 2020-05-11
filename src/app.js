const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");
const aws = require("aws-sdk");
const uniqid = require("uniqid");
const isLogin = require("./middlewares/isLogin");
const { formatDate } = require("./helper");
const codingController = require("./controllers/coding.controller");
const userController = require("./controllers/user.controller");
const authController = require("./controllers/auth.controller");
const questionController = require("./controllers/question.controller");
const { CORE } = require("./constants");
const QuestionModel = require("./models/Question");

const javascriptRunnerURL = process.env.JAVASCRIPT_RUNNER;
const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

console.log("CORE.MONGO_URI", CORE.MONGO_URI)

const s3 = new aws.S3({
  accessKeyId: CORE.S3_ACCESS_KEY,
  secretAccessKey: CORE.S3_SECRET_KEY,
});

const uploadFileToS3 = (s3, params) => {
  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      console.log(err);
      if (err) {
        reject(err);
      } else {
        resolve(data.Key);
      }
    });
  });
};

app.post("/code/excute", async (req, res, next) => {
  const { code, question } = req.body;

  const questionObj = await QuestionModel.findOne({ _id: question });

  const codingFilename = `${uniqid()}-${formatDate(new Date())}.js`;
  const testingFilename = `${uniqid()}-${formatDate(new Date())}.js`;

  const sourceName = await uploadFileToS3(s3, {
    Bucket: "codingame",
    Key: `project/sourceCode/${codingFilename}`,
    Body: code,
  });

  const testCase = await uploadFileToS3(s3, {
    Bucket: "codingame",
    Key: `project/sourceCode/${testingFilename}`,
    Body: questionObj.testing,
  });

  const { data } = await axios.post(
    `${javascriptRunnerURL}/javascript-code/excute`,
    {
      sourceName,
      testCaseName: testCase,
      language: questionObj.language,
    }
  );

  res.jsonp({
    success: true,
    results: {
      data: JSON.parse(data.data),
    },
    message: `/code/excute`,
  });
});

app.post("/coding/upload-exercise", codingController.uploadExercise);

app.post("/coding/run", async (req, res, next) => {
  const { coding, testing, language } = req.body;
  const codingFilename = `${uniqid()}-${formatDate(new Date())}.js`;
  const testingFilename = `${uniqid()}-${formatDate(new Date())}.js`;

  const sourceName = await uploadFileToS3(s3, {
    Bucket: "codingame",
    Key: `project/sourceCode/${codingFilename}`,
    Body: coding,
  });

  const testCase = await uploadFileToS3(s3, {
    Bucket: "codingame",
    Key: `project/sourceCode/${testingFilename}`,
    Body: testing,
  });

  const { data } = await axios.post(
    `${javascriptRunnerURL}/javascript-code/excute`,
    {
      sourceName,
      testCaseName: testCase,
      language,
    }
  );

  res.jsonp({
    success: true,
    results: {
      data: JSON.parse(data.data),
    },
    message: `Run code successfully!`,
  });
});

app.get("/users", userController.listUsers);
app.patch("/users/reset-password", userController.resetPassword);
app.post(
  "/users",
  upload.single("avatar"),
  userController.uploadAvatar,
  userController.createUser
);
app.patch("/users/:userId/status", userController.updateStatus);
app.patch("/users/change-password", isLogin, userController.changePassword);
app.post("/users/forget-password", userController.forgetPassword);
app.post("/questions/create", isLogin, questionController.createQuestion);
app.get("/questions", questionController.listQuestions);
app.patch("/questions/:questionId/status", questionController.updateStatus);
app.get("/questions/:questionId", questionController.getQuestion);

app.get("/me", isLogin, userController.getOwn);
app.post(
  "/users/upload-avatar",
  upload.single("avatar"),
  userController.uploadAvatar
);

app.post("/auth/login", authController.login);

app.get("/ping", (req, res, next) => {
  res.status(200).jsonp({
    success: true,
    results: [],
    message: `I'm codingame-server`,
  });
});

module.exports = app;
