const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Forbidden: admin access required' });
  }

  next();
};

module.exports = adminAuth;