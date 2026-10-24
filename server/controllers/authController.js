const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Institute = require("../models/Institute");
const generateToken = require("../utils/generateToken");

const buildAuthResponse = (user, token) => ({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
    isSuperAdmin: user.role === "super_admin",
  },
});

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      accountType = "user",
      instituteName,
    } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 6
    ) {
      return res
        .status(400)
        .json({
          message:
            "Provide a valid email and a password with at least 6 characters",
        });
    }
    if (!["user", "institute"].includes(accountType)) {
      return res
        .status(400)
        .json({ message: "accountType must be user or institute" });
    }
    if (
      accountType === "institute" &&
      (typeof instituteName !== "string" ||
        !instituteName.trim())
    ) {
      return res
        .status(400)
        .json({
          message: "An institute name is required",
        });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const configuredSuperAdminEmail = process.env.SUPER_ADMIN_EMAIL
      ?.trim()
      .toLowerCase();
    const role =
      configuredSuperAdminEmail && normalizedEmail === configuredSuperAdminEmail
        ? "super_admin"
        : "user";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const session = await mongoose.startSession();
    let user;
    let institute;
    try {
      await session.withTransaction(async () => {
        const existingUser = await User.findOne({
          email: normalizedEmail,
        }).session(session);
        if (existingUser) {
          const error = new Error("Email is already registered");
          error.statusCode = 409;
          throw error;
        }
        [user] = await User.create(
          [
            {
              name: name.trim(),
              email: normalizedEmail,
              password: hashedPassword,
              authProvider: "local",
              role,
            },
          ],
          { session },
        );

        if (accountType === "institute") {
          [institute] = await Institute.create(
            [
              {
                name: instituteName.trim(),
                contactEmail: normalizedEmail,
                ownerId: user._id,
              },
            ],
            { session },
          );
        }
      });
    } finally {
      await session.endSession();
    }

    const token = generateToken(user._id);
    return res.status(201).json({
      ...buildAuthResponse(user, token),
      ...(institute ? { institute } : {}),
    });
  } catch (error) {
    return res
      .status(error.statusCode || (error.code === 11000 ? 409 : 500))
      .json({
        message: error.statusCode ? error.message : "Registration failed",
        ...(error.statusCode ? {} : { error: error.message }),
      });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user || user.authProvider !== "local") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    return res.status(200).json(buildAuthResponse(user, token));
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login failed", error: error.message });
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
    isSuperAdmin: req.user.role === "super_admin",
  });
};

module.exports = { register, login, getMe };
