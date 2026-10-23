const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

  if (!isAdmin) {
    return res.status(403).json({ message: 'Forbidden: admin access required' });
  }

  next();
};

module.exports = adminAuth;
