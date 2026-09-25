// import bcrypt from 'bcryptjs';
// import { OAuth2Client } from 'google-auth-library';
// import User from '../models/User.js';
// import { generateToken } from '../utils/generateToken.js';

// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// export async function register(req, res, next) {
//   try {
//     const { name, email, password } = req.body;

//     const existing = await User.findOne({ email });
//     if (existing) return res.status(409).json({ message: 'Email already registered' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email, password: hashedPassword });

//     res.status(201).json({
//       message: 'Registration successful',
//       user: { id: user._id, name: user.name, email: user.email, role: user.role },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function login(req, res, next) {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user?.password || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     res.json({
//       token: generateToken(user._id),
//       user: { id: user._id, name: user.name, email: user.email, role: user.role },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function googleLogin(req, res, next) {
//   try {
//     const { credential } = req.body;
//     const ticket = await googleClient.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const email = payload.email;

//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         name: payload.name || email.split('@')[0],
//         email,
//         googleId: payload.sub,
//       });
//     }

//     res.json({
//       token: generateToken(user._id),
//       user: { id: user._id, name: user.name, email: user.email, role: user.role },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildAuthResponse = (user, token) => ({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
  },
});

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase() ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local',
      role,
    });

    const token = generateToken(user._id);
    return res.status(201).json(buildAuthResponse(user, token));
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

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
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// @route POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Google idToken is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
      const role = email === process.env.ADMIN_EMAIL?.toLowerCase() ? 'admin' : 'user';
      user = await User.create({
        name,
        email,
        authProvider: 'google',
        role,
      });
    }

    const token = generateToken(user._id);
    return res.status(200).json(buildAuthResponse(user, token));
  } catch (error) {
    return res.status(401).json({ message: 'Google authentication failed', error: error.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  return res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    authProvider: req.user.authProvider,
  });
};

module.exports = { register, login, googleAuth, getMe };