const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { validateExamJson, importExam } = require('../services/examImportService');

const validExam = {
  exam: 'Sample exam',
  subject: 'Science',
  duration: 30,
  questions: [{
    question: 'What is 1 + 1?',
    options: ['1', '2', '3', '4'],
    correctAnswer: '2',
    explanation: 'Basic arithmetic.',
  }],
};

test('exam import accepts optional publication visibility', () => {
  assert.deepEqual(validateExamJson({ ...validExam, isPublished: false }), []);
  assert.deepEqual(validateExamJson({ ...validExam, isPublished: true }), []);
});

test('exam import rejects invalid publication visibility and malformed question entries', () => {
  const errors = validateExamJson({
    ...validExam,
    isPublished: 'false',
    questions: [null],
  });

  assert.ok(errors.includes('"isPublished" must be a boolean when provided'));
  assert.ok(errors.includes('Question 1: must be an object'));
});

test('institute exam import applies ownership to the exam and its questions', async (t) => {
  const instituteId = new mongoose.Types.ObjectId();
  const examId = new mongoose.Types.ObjectId();
  let examDocument;
  let insertedQuestions;
  const session = {
    startTransaction() {},
    async commitTransaction() {},
    async abortTransaction() {},
    endSession() {},
  };

  t.mock.method(mongoose, 'startSession', async () => session);
  t.mock.method(Exam, 'create', async ([document]) => {
    examDocument = document;
    return [{ ...document, _id: examId }];
  });
  t.mock.method(Question, 'insertMany', async (documents) => {
    insertedQuestions = documents;
    return documents;
  });

  const exam = await importExam({ ...validExam, isPublished: false }, { instituteId });

  assert.equal(exam._id, examId);
  assert.equal(examDocument.instituteId, instituteId);
  assert.equal(examDocument.isPublished, false);
  assert.equal(insertedQuestions[0].instituteId, instituteId);
  assert.equal(insertedQuestions[0].examId, examId);
});
