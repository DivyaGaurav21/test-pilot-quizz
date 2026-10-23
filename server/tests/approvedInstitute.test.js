const test = require('node:test');
const assert = require('node:assert/strict');
const Institute = require('../models/Institute');
const approvedInstitute = require('../middleware/approvedInstitute');

const buildResponse = () => ({
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

test('approvedInstitute attaches only the signed-in owner institute', async (t) => {
  const institute = { _id: 'institute-1', status: 'approved' };
  let query;
  t.mock.method(Institute, 'findOne', async (filter) => {
    query = filter;
    return institute;
  });

  const req = { user: { _id: 'user-1' } };
  const res = buildResponse();
  let nextCalled = false;

  await approvedInstitute(req, res, () => {
    nextCalled = true;
  });

  assert.deepEqual(query, { ownerId: 'user-1', status: 'approved' });
  assert.equal(req.institute, institute);
  assert.equal(nextCalled, true);
});

test('approvedInstitute rejects accounts without an approved institute', async (t) => {
  t.mock.method(Institute, 'findOne', async () => null);

  const res = buildResponse();
  let nextCalled = false;
  await approvedInstitute({ user: { _id: 'user-1' } }, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: 'An approved institute account is required' });
  assert.equal(nextCalled, false);
});

test('approvedInstitute reports database failures explicitly', async (t) => {
  t.mock.method(Institute, 'findOne', async () => {
    throw new Error('database unavailable');
  });

  const res = buildResponse();
  await approvedInstitute({ user: { _id: 'user-1' } }, res, () => {});

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, 'Failed to verify institute access');
  assert.equal(res.body.error, 'database unavailable');
});
