const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const aws = require('aws-sdk');
const uniqid = require('uniqid');
const isLogin = require('./middlewares/isLogin');
const { formatDate } = require('./helper');
const codingController = require('./controllers/coding.controller');
const userController = require('./controllers/user.controller');
const authController = require('./controllers/auth.controller');

const javascriptRunnerURL = `http://localhost:7010`;
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/codingame', {
  useNewUrlParser: true
});

const s3 = new aws.S3({
  accessKeyId: 'AKIAVF6JF4IEEA4653NX',
  secretAccessKey: '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'
});

const uploadFileToS3 = (s3, params) => {
  return new Promise((resolve, reject) => {
    s3.upload(params, function(err, data) {
      console.log(err);
      if (err) {
        reject(err);
      } else {
        resolve(data.Key);
      }
    });
  });
};

app.post('/code/excute', async (req, res, next) => {
  const { code } = req.body;
  const filename = `${uniqid()}-${formatDate(new Date())}.js`;

  const sourceName = await uploadFileToS3(s3, {
    Bucket: 'codingame',
    Key: `sourceCode/${filename}`,
    Body: code
  });

  const { data } = await axios.post(
    `${javascriptRunnerURL}/javascript-code/excute`,
    {
      sourceName,
      testCaseName: 'jdskj35jkdf.test.js'
    }
  );

  res.jsonp({
    success: true,
    results: {
      data: JSON.parse(data.data)
    },
    message: `/code/excute`
  });
});

app.post('/coding/upload-exercise', codingController.uploadExercise);

app.get('/users', isLogin, userController.listUsers);
app.post('/users', isLogin,userController.createUser);

app.post('/auth/login', authController.login);

app.get('/ping', (req, res, next) => {
  res.status(200).jsonp({
    success: true,
    results: [],
    message: `I'm codingame-server`
  });
});

module.exports = app;
