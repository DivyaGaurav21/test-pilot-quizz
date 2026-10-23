const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { isBootstrapAdminEmail, publicUser, ROLES } = require('../constants/roles');
const { sendError } = require('../utils/httpError');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const assignRoleForEmail = (email) =>
  (isBootstrapAdminEmail(email) ? ROLES.LEGACY_ADMIN : ROLES.LEGACY_USER);

const buildAuthResponse = (user, token) => ({
  token,
  user: publicUser(user),
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: 'local',
      role: assignRoleForEmail(normalizedEmail),
    });

    const token = generateToken(user._id);
    return res.status(201).json(buildAuthResponse(user, token));
  } catch (error) {
    return sendError(res, 500, 'Registration failed', error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');

    if (!user || user.authProvider !== 'local') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    return res.status(200).json(buildAuthResponse(user, token));
  } catch (error) {
    return sendError(res, 500, 'Login failed', error);
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Google idToken is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: 'Google sign-in is not configured' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || payload.email_verified === false) {
      return res.status(401).json({ message: 'Google authentication failed' });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        authProvider: 'google',
        role: assignRoleForEmail(email),
      });
    }

    const token = generateToken(user._id);
    return res.status(200).json(buildAuthResponse(user, token));
  } catch (error) {
    return sendError(res, 401, 'Google authentication failed', error);
  }
};

const getMe = async (req, res) => {
  return res.status(200).json(publicUser(req.user));
};

module.exports = { register, login, googleAuth, getMe };
