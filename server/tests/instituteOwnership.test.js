const test = require('node:test');
const assert = require('node:assert/strict');
const Exam = require('../models/Exam');
const { updateInstituteExam } = require('../controllers/instituteController');

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

test('institute exam updates are scoped to the authenticated institute', async (t) => {
  let filter;
  t.mock.method(Exam, 'findOneAndUpdate', async (query) => {
    filter = query;
    return null;
  });

  const res = buildResponse();
  await updateInstituteExam({
    params: { id: '507f1f77bcf86cd799439011' },
    body: { isPublished: false, instituteId: 'attacker-controlled-id' },
    institute: { _id: '507f191e810c19729de860ea' },
  }, res);

  assert.deepEqual(filter, {
    _id: '507f1f77bcf86cd799439011',
    instituteId: '507f191e810c19729de860ea',
  });
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: 'Exam not found' });
});
