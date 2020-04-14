const UserModel = require("../models/User");
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

  const newUser = new UserModel(body);
  newUser.password = hashedPassword;

  await newUser.save();

  res.jsonp({
    success: true,
    data: newUser,
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
  const extFile = req.file.originalname.split(".").pop();
  const filename = [makeid(20), extFile].join(".");

  const avatar = await uploadFileToS3(s3, {
    Bucket: "codingame",
    Key: `project/users/avatar/${filename}`,
    ACL: "public-read",
    ContentType: req.file.mimetype,
    Body: req.file.buffer,
  });

  res.status(200).json({
    success: true,
    results: {
      imageUrl: avatar,
    },
    message: "Upload file successfully!",
  });
};

const updateStatus = async (req, res, next) => {
  const { userId } = req.params;

  const user = await UserModel.findOne({ _id: userId });

  user.isActived = !user.isActived;

  await user.save();

  res.status(200).json({
    success: true,
    results: {
      isActived: user.isActived
    },
    message: "Change status successfully!",
  });
};

module.exports = {
  createUser,
  listUsers,
  uploadAvatar,
  updateStatus,
};
