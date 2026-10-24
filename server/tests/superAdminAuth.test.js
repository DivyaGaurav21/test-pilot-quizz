const test = require('node:test');
const assert = require('node:assert/strict');
const superAdminAuth = require('../middleware/superAdminAuth');

const response = () => ({
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

test('superAdminAuth permits the SUPER_ADMIN role', () => {
  const res = response();
  let nextCalled = false;
  superAdminAuth({ user: { role: 'super_admin', email: 'root@example.com' } }, res, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('superAdminAuth rejects non-super admins even when email matches ADMIN_EMAIL', () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;
  process.env.ADMIN_EMAIL = 'root@example.com';
  const res = response();

  try {
    superAdminAuth({ user: { role: 'user', email: 'root@example.com' } }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { message: 'Forbidden: SUPER_ADMIN access required' });
  } finally {
    if (originalAdminEmail === undefined) {
      delete process.env.ADMIN_EMAIL;
    } else {
      process.env.ADMIN_EMAIL = originalAdminEmail;
    }
  }
});
