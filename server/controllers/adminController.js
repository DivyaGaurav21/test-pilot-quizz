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
