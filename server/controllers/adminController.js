const { validateExamJson, importExam } = require('../services/examImportService');
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Question = require('../models/Question')
const Result = require('../models/Result');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route POST /api/admin/import-json
const importJson = async (req, res) => {
  try {
    const examData = req.body;

    const errors = validateExamJson(examData);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid exam JSON', errors });
    }

    const exam = await importExam(examData);

    return res.status(201).json({
      message: 'Exam imported successfully',
      exam: {
        id: exam._id,
        title: exam.title,
        subject: exam.subject,
        totalQuestions: exam.totalQuestions,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to import exam', error: error.message });
  }
};

// @route GET /api/admin/results
const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('userId', 'name email')
      .populate('examId', 'title subject')
      .sort({ submittedAt: -1 });

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
};

// @route DELETE /api/admin/exams/:id
// const deleteExam = async (req, res) => {
//   const { id } = req.params;

//   if (!isValidObjectId(id)) {
//     return res.status(400).json({ message: 'Invalid exam id' });
//   }

//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const exam = await Exam.findById(id).session(session);

//     if (!exam) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: 'Exam not found' });
//     }

//     // Step 1: Related questions delete karo
//     const deletedQuestions = await Question.deleteMany({ examId: id }).session(session);

//     // Step 2 (OPTIONAL): Agar results bhi delete karne hain, ye uncomment karo
//     const deletedResults = await Result.deleteMany({ examId: id }).session(session);

//     // Step 3: Exam delete karo
//     await Exam.findByIdAndDelete(id).session(session);

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       message: 'Exam deleted successfully',
//       deletedQuestionsCount: deletedQuestions.deletedCount,
//       // deletedResultsCount: deletedResults.deletedCount, // agar results delete kiye hain
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     return res.status(500).json({ message: 'Failed to delete exam', error: error.message });
//   }
// };


//Without Transaction

const deleteExam = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid exam id' });
  }

  try {
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const deletedQuestions = await Question.deleteMany({ examId: id });
    await Exam.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Exam deleted successfully',
      deletedQuestionsCount: deletedQuestions.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete exam', error: error.message });
  }
};


module.exports = { importJson, getAllResults , deleteExam};
