const UserModel = require("../models/User");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const aws = require("aws-sdk");
const { makeid, uploadFileToS3 } = require("../libs/helper");
const { CORE } = require("../constants");

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
  const users = await UserModel.find({});

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
};

module.exports = {
  createUser,
  listUsers,
  uploadAvatar,
  updateStatus,
  changePassword,
  getOwn,
  forgetPassword,
};
