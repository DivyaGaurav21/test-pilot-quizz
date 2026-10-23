const Institute = require('../models/Institute');
const Exam = require('../models/Exam');
const Subscription = require('../models/Subscription');
const PublicationEvent = require('../models/PublicationEvent');
const MonetizationSettings = require('../models/MonetizationSettings');

class PublicationLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PublicationLimitError';
    this.statusCode = 402;
  }
}

const getSettings = async (session) => {
  return MonetizationSettings.findByIdAndUpdate(
    'platform',
    { $setOnInsert: { _id: 'platform' } },
    { new: true, upsert: true, setDefaultsOnInsert: true, session },
  );
};

const recordPublication = async ({ instituteId, examId, userId, session, settings: providedSettings }) => {
  const settings = providedSettings || await getSettings(session);
  const freeClaim = settings.freePublicationLimit > 0
    ? await Institute.updateOne(
      {
        _id: instituteId,
        status: 'approved',
        $or: [
          { freePublicationsUsed: { $lt: settings.freePublicationLimit } },
          { freePublicationsUsed: { $exists: false } },
        ],
      },
      { $inc: { freePublicationsUsed: 1, payoutBalanceVersion: 1 } },
      { session },
    )
    : { modifiedCount: 0 };

  let subscription = null;
  let source = 'lifetime_free';
  if (freeClaim.modifiedCount !== 1) {
    subscription = await Subscription.findOneAndUpdate(
      {
        instituteId,
        status: 'active',
        startsAt: { $lte: new Date() },
        endsAt: { $gt: new Date() },
        $expr: { $lt: ['$publicationsUsed', '$publicationLimit'] },
      },
      { $inc: { publicationsUsed: 1 } },
      { new: true, session },
    );
    if (!subscription) {
      throw new PublicationLimitError('Lifetime free publications are used. An active subscription with remaining publications is required.');
    }
    source = 'subscription';
  }

  const publish = await Exam.updateOne(
    { _id: examId, instituteId, isPublished: false },
    { $set: { isPublished: true } },
    { session },
  );
  if (publish.modifiedCount !== 1) {
    throw new Error('Exam could not be published');
  }

  await PublicationEvent.create([{
    instituteId,
    examId,
    subscriptionId: subscription?._id || null,
    source,
    periodStartsAt: subscription?.startsAt || null,
    periodEndsAt: subscription?.endsAt || null,
    createdBy: userId,
  }], { session });
};

const unpublishExam = async ({ instituteId, examId, session }) => {
  return Exam.updateOne({ _id: examId, instituteId, isPublished: true }, { $set: { isPublished: false } }, { session });
};

module.exports = { getSettings, recordPublication, unpublishExam, PublicationLimitError };
