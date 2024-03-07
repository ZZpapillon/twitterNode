const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
  // Get token from headers, cookies, or request body
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token || req.body.token;

  if (!token) {
    return res.status(401).json({ message: 'Wrong email or password. Try again!' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded; // Attach decoded user information to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = verifyToken;