const UserModel = require('../models/User');
const bcrypt = require('bcrypt');

const createUser = async (req, res, next) => {
  const { body } = req;

  if (!body.email)
    return res.status(400).jsonp({
      success: false,
      message: 'Email is required'
    });

  if (!body.password)
    return res.status(400).jsonp({
      success: false,
      message: 'Password is required'
    });

  if (!body.role)
    return res.status(400).jsonp({
      success: false,
      message: 'Role is required'
    });

  const isExisted = await UserModel.findOne({
    email: body.email
  });

  if (isExisted)
    return res.status(400).jsonp({
      success: false,
      message: 'Email is existed!'
    });

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const newUser = new UserModel(body);
  newUser.password = hashedPassword;

  await newUser.save();

  res.jsonp({
    success: true,
    data: newUser
  });
};

const listUsers = async (req, res, next) => {
  const users = await UserModel.find({});

  res.jsonp({
    success: true,
    data: users
  });
};

module.exports = {
  createUser,
  listUsers
};
