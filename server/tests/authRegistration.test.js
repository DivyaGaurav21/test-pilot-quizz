const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../models/User');
const Institute = require('../models/Institute');
const { register } = require('../controllers/authController');

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test('registration rejects administrator account types', async () => {
  const response = createResponse();

  await register({
    body: {
      name: 'Operator',
      email: 'operator@example.com',
      password: 'secure-password',
      accountType: 'super_admin',
    },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { message: 'accountType must be user or institute' });
});

test('institute registration creates a user and a pending application atomically', async (t) => {
  let createdUser;
  let createdInstitute;
  const userId = new mongoose.Types.ObjectId();
  const session = {
    async withTransaction(callback) {
      await callback();
    },
    async endSession() {},
  };
  t.mock.method(mongoose, 'startSession', async () => session);
  t.mock.method(User, 'findOne', () => ({ session: async () => null }));
  t.mock.method(User, 'create', async ([userData]) => {
    createdUser = { ...userData, _id: userId };
    return [createdUser];
  });
  t.mock.method(Institute, 'create', async ([instituteData]) => {
    createdInstitute = { ...instituteData, _id: new mongoose.Types.ObjectId(), status: 'pending' };
    return [createdInstitute];
  });

  const originalJwtSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'auth-registration-test-secret';
  const response = createResponse();
  try {
    await register({
      body: {
        name: 'Institute Owner',
        email: 'owner@example.com',
        password: 'secure-password',
        accountType: 'institute',
        instituteName: 'Learning Center',
      },
    }, response);
  } finally {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  }

  assert.equal(response.statusCode, 201);
  assert.equal(createdUser.role, 'user');
  assert.equal(createdUser.email, 'owner@example.com');
  assert.equal(createdInstitute.ownerId, userId);
  assert.equal(createdInstitute.contactEmail, 'owner@example.com');
  assert.equal(createdInstitute.status, 'pending');
  assert.equal(response.body.user.role, 'user');
  assert.equal(response.body.institute.name, 'Learning Center');
});

test('registration assigns superadmin only to the configured email', async (t) => {
  const session = {
    async withTransaction(callback) {
      await callback();
    },
    async endSession() {},
  };
  t.mock.method(mongoose, 'startSession', async () => session);
  t.mock.method(User, 'findOne', () => ({ session: async () => null }));
  t.mock.method(User, 'create', async ([userData]) => [
    { ...userData, _id: new mongoose.Types.ObjectId() },
  ]);

  const originalJwtSecret = process.env.JWT_SECRET;
  const originalSuperAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  process.env.JWT_SECRET = 'auth-registration-test-secret';
  process.env.SUPER_ADMIN_EMAIL = 'owner@example.com';
  const response = createResponse();
  try {
    await register({
      body: {
        name: 'Application Owner',
        email: ' OWNER@EXAMPLE.COM ',
        password: 'secure-password',
      },
    }, response);
  } finally {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
    if (originalSuperAdminEmail === undefined) {
      delete process.env.SUPER_ADMIN_EMAIL;
    } else {
      process.env.SUPER_ADMIN_EMAIL = originalSuperAdminEmail;
    }
  }

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.user.email, 'owner@example.com');
  assert.equal(response.body.user.role, 'super_admin');
  assert.equal(response.body.user.isSuperAdmin, true);
});
