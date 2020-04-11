const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

const login = async (req, res, next) => {
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

  const user = await UserModel.findOne({
    email: body.email
  });

  if (!user)
    return res.jsonp({
      success: false,
      message: 'User is not found'
    });

  const isPassed = await bcrypt.compare(body.password, user.password);

  if (!isPassed) {
    return res.status(400).jsonp({
      success: false,
      message: 'Password is not matched'
    });
  }

  const JWT = await jwt.sign(
    {
      _id: user._id,
      email: user.email
    },
    config.get('SECRET'),
    { expiresIn: config.get('SECRET_EXPIRES') }
  );

  res.jsonp({
    success: true,
    data: {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      token: JWT
    }
  });
};

module.exports = {
  login
};
