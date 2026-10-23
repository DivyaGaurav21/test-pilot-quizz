const ROLES = {
  STUDENT: 'STUDENT',
  INSTITUTE_ADMIN: 'INSTITUTE_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  LEGACY_USER: 'user',
  LEGACY_ADMIN: 'admin',
};

const USER_ROLE_ENUM = [
  ROLES.LEGACY_USER,
  ROLES.LEGACY_ADMIN,
  ROLES.STUDENT,
  ROLES.INSTITUTE_ADMIN,
  ROLES.SUPER_ADMIN,
];

const normalizeRole = (role) => {
  if (role === ROLES.LEGACY_ADMIN || role === ROLES.SUPER_ADMIN) {
    return ROLES.SUPER_ADMIN;
  }
  if (role === ROLES.INSTITUTE_ADMIN) {
    return ROLES.INSTITUTE_ADMIN;
  }
  return ROLES.STUDENT;
};

const emailsMatch = (a, b) => {
  if (!a || !b) return false;
  return String(a).toLowerCase() === String(b).toLowerCase();
};

const isBootstrapAdminEmail = (email) =>
  emailsMatch(email, process.env.ADMIN_EMAIL);

const isSuperAdmin = (user) => {
  if (!user) return false;
  if (normalizeRole(user.role) === ROLES.SUPER_ADMIN) return true;
  return isBootstrapAdminEmail(user.email);
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  normalizedRole: normalizeRole(user.role),
  authProvider: user.authProvider,
  createdAt: user.createdAt,
});

module.exports = {
  ROLES,
  USER_ROLE_ENUM,
  normalizeRole,
  emailsMatch,
  isBootstrapAdminEmail,
  isSuperAdmin,
  publicUser,
};
