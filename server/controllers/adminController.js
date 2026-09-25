// import Exam from '../models/Exam.js';
// import Question from '../models/Question.js';

// export async function importExam(req, res, next) {
//   try {
//     const {
//       exam,
//       name,
//       description,
//       subject,
//       topic,
//       difficulty,
//       durationMinutes,
//       time,
//       questions = [],
//     } = req.body;

//     const examName = name || exam;
//     const duration = durationMinutes || time;

//     if (!examName || !duration || !Array.isArray(questions)) {
//       return res.status(400).json({
//         message: 'exam/name, duration/time and questions are required',
//       });
//     }

//     const createdExam = await Exam.create({
//       name: examName,
//       description,
//       subject,
//       topic,
//       difficulty,
//       durationMinutes: Number(duration),
//       totalQuestions: questions.length,
//     });

//     const normalizedQuestions = questions.map((item, index) => ({
//       exam: createdExam._id,
//       externalId: item.id ?? index + 1,
//       question: item.question,
//       options: item.options || [],
//       correctAnswer:
//         typeof item.correctAnswer === 'number'
//           ? item.correctAnswer
//           : Number(item.answerIndex ?? 0),
//       explanation: item.explanation,
//     }));

//     await Question.insertMany(normalizedQuestions);

//     res.status(201).json({
//       message: 'Exam imported successfully',
//       exam: createdExam,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

const { validateExamJson, importExam } = require('../services/examImportService');
const Result = require('../models/Result');

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

module.exports = { importJson, getAllResults };
