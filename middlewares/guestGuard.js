const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.role === 'GUEST') {
      if (global.io) {
        global.io.emit('guest_warning', { message: 'Guest mode cannot modify data' });
      }
      return res.status(403).json({ message: 'Guest users cannot perform this action' });
    }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: e.message });
  }
};
