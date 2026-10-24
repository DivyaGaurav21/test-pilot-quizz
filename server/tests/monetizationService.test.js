const test = require('node:test');
const assert = require('node:assert/strict');
const Institute = require('../models/Institute');
const Exam = require('../models/Exam');
const Subscription = require('../models/Subscription');
const PublicationEvent = require('../models/PublicationEvent');
const { recordPublication, PublicationLimitError } = require('../services/monetizationService');

test('recordPublication atomically consumes a lifetime free publication first', async (t) => {
  let freeFilter;
  t.mock.method(Institute, 'updateOne', async (filter) => {
    freeFilter = filter;
    return { modifiedCount: 1 };
  });
  t.mock.method(Subscription, 'findOneAndUpdate', async () => {
    throw new Error('paid subscription should not be used');
  });
  t.mock.method(Exam, 'updateOne', async () => ({ modifiedCount: 1 }));
  let event;
  t.mock.method(PublicationEvent, 'create', async (events) => {
    event = events[0];
  });

  await recordPublication({
    instituteId: 'institute-1',
    examId: 'exam-1',
    userId: 'owner-1',
    session: {},
    settings: { freePublicationLimit: 3 },
  });

  assert.deepEqual(freeFilter, {
    _id: 'institute-1',
    status: 'approved',
    $or: [
      { freePublicationsUsed: { $lt: 3 } },
      { freePublicationsUsed: { $exists: false } },
    ],
  });
  assert.equal(event.source, 'lifetime_free');
});

test('recordPublication requires an active paid subscription after free quota is used', async (t) => {
  let subscriptionFilter;
  t.mock.method(Institute, 'updateOne', async () => ({ modifiedCount: 0 }));
  t.mock.method(Subscription, 'findOneAndUpdate', async (filter) => {
    subscriptionFilter = filter;
    return null;
  });
  t.mock.method(Exam, 'updateOne', async () => ({ modifiedCount: 1 }));

  await assert.rejects(recordPublication({
    instituteId: 'institute-1',
    examId: 'exam-1',
    userId: 'owner-1',
    session: {},
    settings: { freePublicationLimit: 3 },
  }), PublicationLimitError);

  assert.equal(subscriptionFilter.status, 'active');
  assert.deepEqual(subscriptionFilter.$expr, { $lt: ['$publicationsUsed', '$publicationLimit'] });
});

test('a zero-free-publication setting skips lifetime-free claims', async (t) => {
  t.mock.method(Institute, 'updateOne', async () => {
    throw new Error('zero quota must not increment lifetime free usage');
  });
  t.mock.method(Subscription, 'findOneAndUpdate', async () => null);
  t.mock.method(Exam, 'updateOne', async () => ({ modifiedCount: 1 }));

  await assert.rejects(recordPublication({
    instituteId: 'institute-1',
    examId: 'exam-1',
    userId: 'owner-1',
    session: {},
    settings: { freePublicationLimit: 0 },
  }), PublicationLimitError);
});
