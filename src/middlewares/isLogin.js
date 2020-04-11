const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  if (!req.headers || !req.headers.authorization)
    return res.jsonp({
      success: false,
      message: 'unauthorization'
    });

  const token = req.headers.authorization;

  try {
    const decoded = jwt.verify(token, config.get('SECRET'));
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).jsonp({
      success: false,
      message: 'Token is invalid'
    });
  }
};
