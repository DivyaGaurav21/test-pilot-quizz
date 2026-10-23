const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Attempt = require('../models/Attempt');
const calculateResult = require('../utils/calculateResult');
const { sendError } = require('../utils/httpError');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeAnswers = (answers) => {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return {};
  }

  const clean = {};
  for (const [key, value] of Object.entries(answers)) {
    if (typeof value === 'string' && value.length <= 2000) {
      clean[key] = value;
    }
  }
  return clean;
};

const answersToObject = (answers) => {
  if (!answers) return {};
  if (answers instanceof Map) return Object.fromEntries(answers);
  if (typeof answers.toObject === 'function') return answers.toObject();
  return { ...answers };
};

const serializeAttempt = (attempt) => ({
  id: attempt._id,
  status: attempt.status,
  startedAt: attempt.startedAt,
  expiresAt: attempt.expiresAt,
  answers: answersToObject(attempt.answers),
});

const getPublishedExam = (id) =>
  Exam.findOne({
    _id: id,
    isPublished: true,
    status: { $ne: 'archived' },
  });

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      isPublished: true,
      status: { $ne: 'archived' },
    }).sort({ createdAt: -1 });
    return res.status(200).json(exams);
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch exams', error);
  }
};

const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid exam id' });
    }

    const exam = await getPublishedExam(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    return res.status(200).json(exam);
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch exam', error);
  }
};

const startExam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid exam id' });
    }

    const exam = await getPublishedExam(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const now = new Date();
    let attempt = await Attempt.findOne({
      userId: req.user._id,
      examId: id,
      status: 'in_progress',
    }).sort({ startedAt: -1 });

    if (attempt && now.getTime() > attempt.expiresAt.getTime() + Attempt.GRACE_SECONDS * 1000) {
      attempt.status = 'expired';
      await attempt.save();
      attempt = null;
    }

    if (!attempt) {
      attempt = await Attempt.create({
        userId: req.user._id,
        examId: id,
        startedAt: now,
        expiresAt: new Date(now.getTime() + exam.duration * 60 * 1000),
        status: 'in_progress',
      });
    }

    const questions = await Question.find({ examId: id }).select('-correctAnswer -explanation');

    return res.status(200).json({
      exam,
      questions,
      attempt: serializeAttempt(attempt),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to start exam', error);
  }
};

const saveAttemptAnswers = async (req, res) => {
  try {
    const { id, attemptId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(attemptId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      examId: id,
      userId: req.user._id,
      status: 'in_progress',
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Active attempt not found' });
    }

    if (!attempt.isWithinSubmitWindow()) {
      return res.status(409).json({ message: 'Attempt has expired' });
    }

    attempt.answers = sanitizeAnswers(req.body.answers);
    await attempt.save();

    return res.status(200).json({ ok: true, attempt: serializeAttempt(attempt) });
  } catch (error) {
    return sendError(res, 500, 'Failed to save answers', error);
  }
};

const finalizeAttempt = async ({ attempt, exam, userId, examId, answers, claimedTimeTaken }) => {
  const now = new Date();
  const serverSeconds = Math.max(0, Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000));
  const durationCap = exam.duration * 60 + Attempt.GRACE_SECONDS;
  const timeTaken = Math.min(serverSeconds, durationCap);

  const questions = await Question.find({ examId });
  const resultData = calculateResult(questions, answers, timeTaken);

  const locked = await Attempt.findOneAndUpdate(
    { _id: attempt._id, status: 'in_progress' },
    {
      $set: {
        status: now > attempt.expiresAt ? 'submitted' : 'submitted',
        submittedAt: now,
        answers,
        claimedTimeTaken,
      },
    },
    { new: true },
  );

  if (!locked) {
    const latest = await Attempt.findById(attempt._id);
    if (latest?.resultId) {
      return Result.findById(latest.resultId);
    }
    if (latest && latest.status === 'submitted' && !latest.resultId) {
      const existing = await Result.findOne({ attemptId: latest._id });
      if (existing) return existing;
    } else {
      return null;
    }
  }

  try {
    const result = await Result.create({
      userId,
      examId,
      attemptId: (locked || attempt)._id,
      answers,
      claimedTimeTaken,
      ...resultData,
    });

    await Attempt.findByIdAndUpdate(attempt._id, { resultId: result._id });
    return result;
  } catch (error) {
    if (error && error.code === 11000) {
      return Result.findOne({ attemptId: attempt._id });
    }
    throw error;
  }
};

const submitExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken, attemptId } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid exam id' });
    }

    const exam = await getPublishedExam(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    let attempt;
    if (attemptId) {
      if (!isValidObjectId(attemptId)) {
        return res.status(400).json({ message: 'Invalid attempt id' });
      }
      attempt = await Attempt.findOne({
        _id: attemptId,
        userId: req.user._id,
        examId: id,
      });
    } else {
      attempt = await Attempt.findOne({
        userId: req.user._id,
        examId: id,
      }).sort({ startedAt: -1 });
    }

    if (!attempt) {
      return res.status(409).json({ message: 'No exam attempt found. Start the exam first.' });
    }

    if (attempt.status === 'submitted' && attempt.resultId) {
      const existing = await Result.findById(attempt.resultId);
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    const sanitized = sanitizeAnswers(answers);
    const claimed =
      typeof timeTaken === 'number' && Number.isFinite(timeTaken) && timeTaken >= 0
        ? timeTaken
        : undefined;

    if (attempt.status === 'in_progress' && !attempt.isWithinSubmitWindow() && Object.keys(sanitized).length === 0) {
      const stored = answersToObject(attempt.answers);
      Object.assign(sanitized, stored);
    }

    const result = await finalizeAttempt({
      attempt,
      exam,
      userId: req.user._id,
      examId: id,
      answers: sanitized,
      claimedTimeTaken: claimed,
    });

    if (!result) {
      return res.status(409).json({ message: 'Attempt is no longer active' });
    }

    const status = result.submittedAt && Date.now() - new Date(result.submittedAt).getTime() < 2000 ? 201 : 200;
    return res.status(attempt.status === 'submitted' ? 200 : status).json(result);
  } catch (error) {
    return sendError(res, 500, 'Failed to submit exam', error);
  }
};

module.exports = { getExams, getExamById, startExam, submitExam, saveAttemptAnswers };
