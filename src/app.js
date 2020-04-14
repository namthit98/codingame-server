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
const { CORE } = require("./constants");

const javascriptRunnerURL = process.env.JAVASCRIPT_RUNNER;
const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

mongoose.connect(CORE.MONGO_URI, {
  useNewUrlParser: true,
});

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
  const { code } = req.body;
  const filename = `${uniqid()}-${formatDate(new Date())}.js`;

  const sourceName = await uploadFileToS3(s3, {
    Bucket: "codingame",
    Key: `sourceCode/${filename}`,
    Body: code,
  });

  const { data } = await axios.post(
    `${javascriptRunnerURL}/javascript-code/excute`,
    {
      sourceName,
      testCaseName: "jdskj35jkdf.test.js",
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

app.get("/users", isLogin, userController.listUsers);
app.post("/users", userController.createUser);
app.patch("/users/:userId/status", userController.updateStatus);
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
