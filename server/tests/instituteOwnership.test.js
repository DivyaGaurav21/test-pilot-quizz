const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Institute = require('../models/Institute');
const {
  registerInstitute,
  updateInstituteExam,
} = require('../controllers/instituteController');

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

test('institute applications use the authenticated account email as contact email', async (t) => {
  let createdInstitute;
  t.mock.method(Institute, 'findOne', async () => null);
  t.mock.method(Institute, 'create', async (instituteData) => {
    createdInstitute = instituteData;
    return instituteData;
  });

  const res = buildResponse();
  await registerInstitute({
    body: {
      name: 'Learning Center',
      contactEmail: 'different@example.com',
    },
    user: {
      _id: 'owner-1',
      email: ' OWNER@EXAMPLE.COM ',
    },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(createdInstitute.name, 'Learning Center');
  assert.equal(createdInstitute.contactEmail, 'owner@example.com');
  assert.equal(createdInstitute.ownerId, 'owner-1');
});

test('institute exam updates are scoped to the authenticated institute', async (t) => {
  let filter;
  const session = {
    async withTransaction(callback) {
      await callback();
    },
    async endSession() {},
  };
  const exam = {
    isPublished: false,
    pricePaise: 0,
    async save() {},
  };
  t.mock.method(mongoose, 'startSession', async () => session);
  t.mock.method(Exam, 'findOne', (query) => {
    filter = query;
    return { session: () => exam };
  });

  const res = buildResponse();
  await updateInstituteExam({
    params: { id: '507f1f77bcf86cd799439011' },
    body: { pricePaise: 4500, instituteId: 'attacker-controlled-id' },
    user: { _id: 'owner-1' },
    institute: { _id: '507f191e810c19729de860ea' },
  }, res);

  assert.deepEqual(filter, {
    _id: '507f1f77bcf86cd799439011',
    instituteId: '507f191e810c19729de860ea',
  });
  assert.equal(res.statusCode, 200);
  assert.equal(exam.pricePaise, 4500);
});
