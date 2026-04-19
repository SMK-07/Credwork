const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }

    try {
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User not found' });
      }
      req.user = user;
      next();
    } catch (e) {
      next(e);
    }
  });
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: Requires ${role} role` });
    }
    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRole
};
