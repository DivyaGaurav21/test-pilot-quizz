const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');
const calculateResult = require('../utils/calculateResult');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route GET /api/exams
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ isPublished: true }).sort({ createdAt: -1 });
    return res.status(200).json(exams);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch exams', error: error.message });
  }
};

// @route GET /api/exams/:id
const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid exam id' });
    }

    const exam = await Exam.findOne({ _id: id, isPublished: true });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    return res.status(200).json(exam);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch exam', error: error.message });
  }
};

// @route POST /api/exams/:id/start
// Returns the exam plus its questions with correctAnswer and explanation stripped,
// so the client cannot see answers before submitting.
const startExam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid exam id' });
    }

    const exam = await Exam.findOne({ _id: id, isPublished: true });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const questions = await Question.find({ examId: id }).select('-correctAnswer -explanation');

    return res.status(200).json({ exam, questions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to start exam', error: error.message });
  }
};

// @route POST /api/exams/:id/submit
// Body: { answers: { [questionId]: selectedOption }, timeTaken: number (seconds) }
const submitExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid exam id' });
    }

    const exam = await Exam.findOne({ _id: id, isPublished: true });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (typeof timeTaken !== 'number' || timeTaken < 0) {
      return res.status(400).json({ message: 'timeTaken must be a non-negative number' });
    }

    // Fetch full questions (including correctAnswer) directly from the DB —
    // never trust any answer key or score sent by the client.
    const questions = await Question.find({ examId: id });

    const resultData = calculateResult(questions, answers || {}, timeTaken);

    const result = await Result.create({
      userId: req.user._id,
      examId: id,
      ...resultData,
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit exam', error: error.message });
  }
};

module.exports = { getExams, getExamById, startExam, submitExam };