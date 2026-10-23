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

test('adminAuth rejects a non-admin user even when email is not an admin email', () => {
  const req = { user: { role: 'user', email: 'student@example.com' } };
  const res = buildResponse();

  adminAuth(req, res, () => {
    throw new Error('next should not be called');
  });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: 'Forbidden: admin access required' });
});
