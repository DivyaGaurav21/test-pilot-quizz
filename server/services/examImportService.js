const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// Validates the raw imported JSON structure and content.
// Returns an array of error messages (empty array = valid).
const validateExamJson = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid JSON payload');
    return errors;
  }

  if (!data.exam || typeof data.exam !== 'string' || !data.exam.trim()) {
    errors.push('"exam" is required and must be a non-empty string');
  }

  if (!data.subject || typeof data.subject !== 'string' || !data.subject.trim()) {
    errors.push('"subject" is required and must be a non-empty string');
  }

  if (
    data.duration === undefined ||
    data.duration === null ||
    typeof data.duration !== 'number' ||
    data.duration <= 0
  ) {
    errors.push('"duration" is required and must be a positive number');
  }

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('"questions" must be a non-empty array');
    return errors; // no point validating individual questions further
  }

  data.questions.forEach((q, index) => {
    const label = `Question ${index + 1}`;

    if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
      errors.push(`${label}: question text is required`);
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`${label}: must contain exactly 4 options`);
    }

    if (
      q.correctAnswer === undefined ||
      q.correctAnswer === null ||
      typeof q.correctAnswer !== 'string' ||
      !q.correctAnswer.trim()
    ) {
      errors.push(`${label}: correctAnswer is required`);
    } else if (Array.isArray(q.options) && !q.options.includes(q.correctAnswer)) {
      errors.push(`${label}: correctAnswer must match one of the options`);
    }

    if (!q.explanation || typeof q.explanation !== 'string' || !q.explanation.trim()) {
      errors.push(`${label}: explanation is required`);
    }
  });

  return errors;
};

// Creates the Exam and its Questions in the database.
// Assumes data has already passed validateExamJson.
const importExam = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const exam = await Exam.create(
      [
        {
          title: data.exam,
          subject: data.subject,
          topic: data.topic || '',
          difficulty: data.difficulty || '',
          duration: data.duration,
          totalQuestions: data.questions.length,
          isPublished: true,
        },
      ],
      { session }
    );

    const createdExam = exam[0];

    const questionsToInsert = data.questions.map((q) => ({
      examId: createdExam._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      marks: 1,
    }));

    await Question.insertMany(questionsToInsert, { session });

    await session.commitTransaction();
    session.endSession();

    return createdExam;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = { validateExamJson, importExam };