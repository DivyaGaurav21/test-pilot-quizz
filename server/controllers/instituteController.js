const mongoose = require('mongoose');
const { validateExamJson, importExam } = require('../services/examImportService');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Institute = require('../models/Institute');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const registerInstitute = async (req, res) => {
  try {
    const body = req.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const contactEmail = typeof body.contactEmail === 'string'
      ? body.contactEmail.trim().toLowerCase()
      : '';

    if (!name || !contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return res.status(400).json({ message: 'A valid institute name and contact email are required' });
    }

    const existing = await Institute.findOne({ ownerId: req.user._id });
    if (existing && existing.status !== 'rejected') {
      return res.status(409).json({ message: 'An institute application already exists for this account' });
    }

    const institute = existing
      ? await Institute.findByIdAndUpdate(
      existing._id,
      {
        $set: {
          name,
          contactEmail,
          status: 'pending',
          rejectionReason: '',
        },
        $unset: { reviewedBy: 1, reviewedAt: 1 },
      },
      { new: true, runValidators: true },
      )
      : await Institute.create({
        name,
        contactEmail,
        ownerId: req.user._id,
      });

    return res.status(existing ? 200 : 201).json(institute);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An institute application already exists for this account' });
    }
    return res.status(500).json({ message: 'Failed to submit institute application', error: error.message });
  }
};

const getMyInstitute = async (req, res) => {
  try {
    const institute = await Institute.findOne({ ownerId: req.user._id });
    return res.status(200).json({ institute });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch institute application', error: error.message });
  }
};

const importInstituteExam = async (req, res) => {
  try {
    const errors = validateExamJson(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid exam JSON', errors });
    }

    const exam = await importExam(req.body, { instituteId: req.institute._id });
    return res.status(201).json({
      message: 'Exam imported successfully',
      exam: {
        id: exam._id,
        title: exam.title,
        subject: exam.subject,
        totalQuestions: exam.totalQuestions,
        isPublished: exam.isPublished,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to import exam', error: error.message });
  }
};

const getInstituteExams = async (req, res) => {
  try {
    const exams = await Exam.find({ instituteId: req.institute._id }).sort({ createdAt: -1 });
    return res.status(200).json(exams);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch institute exams', error: error.message });
  }
};

const updateInstituteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid exam id' });
    }

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ message: 'isPublished must be a boolean' });
    }

    const exam = await Exam.findOneAndUpdate(
      { _id: id, instituteId: req.institute._id },
      { $set: { isPublished } },
      { new: true, runValidators: true },
    );

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    return res.status(200).json(exam);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update institute exam', error: error.message });
  }
};

const getInstituteResults = async (req, res) => {
  try {
    const results = await Result.find({ instituteId: req.institute._id })
      .populate('userId', 'name email')
      .populate('examId', 'title subject')
      .sort({ submittedAt: -1 });

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch institute results', error: error.message });
  }
};

module.exports = {
  registerInstitute,
  getMyInstitute,
  importInstituteExam,
  getInstituteExams,
  updateInstituteExam,
  getInstituteResults,
};
