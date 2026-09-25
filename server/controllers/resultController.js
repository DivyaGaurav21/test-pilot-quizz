// import Exam from '../models/Exam.js';
// import Question from '../models/Question.js';
// import Result from '../models/Result.js';
// import { calculateResult } from '../utils/calculateResult.js';

// export async function createResult(req, res, next) {
//   try {
//     const { examId, answers } = req.body;

//     const exam = await Exam.findById(examId);
//     if (!exam) return res.status(404).json({ message: 'Exam not found' });

//     const questions = await Question.find({ exam: examId }).sort({ externalId: 1 });
//     const resultData = calculateResult(questions, answers);

//     const result = await Result.create({
//       user: req.user._id,
//       exam: examId,
//       answers,
//       ...resultData,
//     });

//     res.status(201).json(result);
//   } catch (error) {
//     next(error);
//   }
// }


const mongoose = require('mongoose');
const Result = require('../models/Result');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route GET /api/results
const getResults = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user._id })
      .populate('examId', 'title subject topic difficulty')
      .sort({ submittedAt: -1 });

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
};

// @route GET /api/results/:id
const getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid result id' });
    }

    const result = await Result.findOne({ _id: id, userId: req.user._id }).populate(
      'examId',
      'title subject topic difficulty duration'
    );

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch result', error: error.message });
  }
};

module.exports = { getResults, getResultById };