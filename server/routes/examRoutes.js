const express = require('express');
const {
  getExams,
  getExamById,
  startExam,
  submitExam,
  saveAttemptAnswers,
} = require('../controllers/examController');
const protect = require('../middleware/auth');

const router = express.Router();

router.get('/', getExams);
router.get('/:id', getExamById);
router.post('/:id/start', protect, startExam);
router.patch('/:id/attempts/:attemptId/answers', protect, saveAttemptAnswers);
router.post('/:id/submit', protect, submitExam);

module.exports = router;