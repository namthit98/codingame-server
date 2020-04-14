const jwt = require('jsonwebtoken');
const { CORE } = require("../constants");

module.exports = (req, res, next) => {
  if (!req.headers || !req.headers.authorization)
    return res.jsonp({
      success: false,
      message: 'unauthorization'
    });

  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, CORE.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).jsonp({
      success: false,
      message: 'Token is invalid'
    });
  }
};
