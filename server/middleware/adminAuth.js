const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const isAdmin = req.user.role === 'admin' || req.user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

  if (!isAdmin) {
    return res.status(403).json({ message: 'Forbidden: admin access required' });
  }

  next();
};

module.exports = adminAuth;
