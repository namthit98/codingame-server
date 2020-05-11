const UserModel = require("../models/User");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const aws = require("aws-sdk");
const { makeid, uploadFileToS3 } = require("../libs/helper");
const { CORE } = require("../constants");
const { sendEmail } = require("@fbeta/helper");

const s3 = new aws.S3({
  accessKeyId: CORE.S3_ACCESS_KEY,
  secretAccessKey: CORE.S3_SECRET_KEY,
});

const createUser = async (req, res, next) => {
  const { body } = req;

  if (!body.email)
    return res.status(400).jsonp({
      success: false,
      message: "Email is required",
    });

  if (!body.password && body.role === "user")
    return res.status(400).jsonp({
      success: false,
      message: "Password is required",
    });

  if (!body.role)
    return res.status(400).jsonp({
      success: false,
      message: "Role is required",
    });

  const isExisted = await UserModel.findOne({
    email: body.email,
  });

  if (isExisted)
    return res.status(400).jsonp({
      success: false,
      message: "Email is existed!",
    });

  const hashedPassword = await bcrypt.hash(
    body.password || CORE.PASSWORD_DEFAUL,
    10
  );

  const newUser = new UserModel({
    ...body,
    avatar: req.avatarUrl,
  });
  newUser.password = hashedPassword;

  await newUser.save();

  res.jsonp({
    success: true,
    data: newUser,
    message: "Create User Successfully !!",
  });
};

const listUsers = async (req, res, next) => {
  const users = await UserModel.find({}).sort("-createdAt");

  res.jsonp({
    success: true,
    data: users,
  });
};

const uploadAvatar = async (req, res, next) => {
  if (!req.file) {
    req.avatarUrl = null;
    return next();
  }
  const extFile = req.file.originalname.split(".").pop();
  const filename = [makeid(20), extFile].join(".");

  const avatar = await uploadFileToS3(s3, {
    Bucket: "codingame",
    Key: `project/users/avatar/${filename}`,
    ACL: "public-read",
    ContentType: req.file.mimetype,
    Body: req.file.buffer,
  });

  req.avatarUrl = avatar;

  next();
};

const updateStatus = async (req, res, next) => {
  const { userId } = req.params;

  const user = await UserModel.findOne({ _id: userId });

  user.isActived = !user.isActived;

  await user.save();

  res.status(200).json({
    success: true,
    results: {
      isActived: user.isActived,
    },
    message: "Change status successfully!",
  });
};

const changePassword = async (req, res, next) => {
  const { _id } = req.user;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return res.status(400).jsonp({
      success: false,
      message: "Data is missed!",
    });

  const user = await UserModel.findOne({ _id });

  const isPassed = await bcrypt.compare(oldPassword, user.password);

  if (!isPassed) {
    return res.status(400).jsonp({
      success: false,
      message: "Old password is not matched!",
    });
  }

  const hashedPassword = await bcrypt.hash(
    newPassword || CORE.PASSWORD_DEFAUL,
    10
  );
  user.password = hashedPassword;

  await user.save();

  res.status(200).json({
    success: true,
    results: _.pick(user, ["firstname", "lastname", "role"]),
    message: "Change password successfully!",
  });
};

const getOwn = async (req, res, next) => {
  const { _id } = req.user;

  const user = await UserModel.findOne({ _id });

  res.status(200).json({
    success: true,
    results: user,
    message: "Get user infomation successfully!",
  });
};

const forgetPassword = async (req, res, next) => {
  const email = req.body.email;

  const user = await UserModel.findOne({ email });

  const JWT = await jwt.sign(
    {
      _id: user._id,
      email,
    },
    CORE.SECRET_KEY_MAIL,
    { expiresIn: "24h" }
  );

  const sendMailData = {
    template: "forgot-password.html", // Email template name is required
    subject: "Congratulation", // Email subject is required
    email: email, // Email address of the recipient is required
    data: {
      url: CORE.WEBSITE_URL + "/password/reset/" + JWT,
    }, // Email content may be empty
  };

  try {
    const a = await sendEmail(sendMailData, {
      api_key: process.env.KEY_SEND_EMAIL,
      domain: process.env.DOMAIN,
    });

    console.log(a);
    res.status(200).json({
      success: true,
      results: null,
      message: "Send mail successfully !!!",
    });
    // => Return promise
  } catch (err) {
    console.log("err", err);
  }
};

const resetPassword = async (req, res, next) => {
  const { password, token } = req.body;

  if (!password)
    return res.status(400).jsonp({
      success: false,
      message: "Data is missed!",
    });

  const decoded = jwt.verify(token, CORE.SECRET_KEY_MAIL);

  console.log(decoded);

  const user = await UserModel.findOne({ _id: decoded._id });

  console.log(user, 11111)

  const hashedPassword = await bcrypt.hash(
    password || CORE.PASSWORD_DEFAUL,
    10
  );
  user.password = hashedPassword;

  console.log(user, 222222222)

  await user.save();

  res.status(200).json({
    success: true,
    results: _.pick(user, ["firstname", "lastname", "role"]),
    message: "Reset password successfully!",
  });
};

module.exports = {
  createUser,
  listUsers,
  uploadAvatar,
  updateStatus,
  changePassword,
  getOwn,
  forgetPassword,
  resetPassword,
};
