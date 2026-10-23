const superAdminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const isSuperAdmin = req.user.role === 'super_admin';

  if (!isSuperAdmin) {
    return res.status(403).json({ message: 'Forbidden: SUPER_ADMIN access required' });
  }

  return next();
};

module.exports = superAdminAuth;
