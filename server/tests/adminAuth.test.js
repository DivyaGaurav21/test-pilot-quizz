const test = require('node:test');
const assert = require('node:assert/strict');

const adminAuth = require('../middleware/adminAuth');

const buildResponse = () => {
  const response = {
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
  };

  return response;
};

test('adminAuth allows a user with the admin role', () => {
  let nextCalled = false;
  const req = { user: { role: 'admin' } };
  const res = buildResponse();

  adminAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('adminAuth rejects a non-admin user even when email matches ADMIN_EMAIL', () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;
  process.env.ADMIN_EMAIL = 'admin@example.com';
  const req = { user: { role: 'user', email: 'admin@example.com' } };
  const res = buildResponse();

  try {
    adminAuth(req, res, () => {
      throw new Error('next should not be called');
    });

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { message: 'Forbidden: admin access required' });
  } finally {
    if (originalAdminEmail === undefined) {
      delete process.env.ADMIN_EMAIL;
    } else {
      process.env.ADMIN_EMAIL = originalAdminEmail;
    }
  }
});
