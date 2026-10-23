const { isSuperAdmin, normalizeRole } = require('../constants/roles');

const requireRoles = (...allowedNormalizedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (isSuperAdmin(req.user) && allowedNormalizedRoles.includes('SUPER_ADMIN')) {
    return next();
  }

  const role = normalizeRole(req.user.role);
  if (!allowedNormalizedRoles.includes(role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return next();
};

module.exports = { requireRoles };
