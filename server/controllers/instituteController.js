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

const getPopularInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.aggregate([
      { $match: { status: 'approved' } },
      {
        $lookup: {
          from: Exam.collection.name,
          let: { instituteId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$instituteId', '$$instituteId'] },
                    { $eq: ['$isPublished', true] },
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'examStats',
        },
      },
      {
        $lookup: {
          from: Result.collection.name,
          let: { instituteId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$instituteId', '$$instituteId'] } } },
            { $count: 'count' },
          ],
          as: 'resultStats',
        },
      },
      {
        $project: {
          name: 1,
          createdAt: 1,
          publishedExamCount: { $ifNull: [{ $arrayElemAt: ['$examStats.count', 0] }, 0] },
          resultCount: { $ifNull: [{ $arrayElemAt: ['$resultStats.count', 0] }, 0] },
        },
      },
      { $match: { publishedExamCount: { $gt: 0 } } },
      { $sort: { resultCount: -1, publishedExamCount: -1, createdAt: -1 } },
      { $limit: 6 },
    ]);
    return res.status(200).json(institutes);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch popular institutes', error: error.message });
  }
};

const importInstituteExam = async (req, res) => {
  try {
    const errors = validateExamJson(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid exam JSON', errors });
    }

    const exam = await importExam(req.body, { instituteId: req.institute._id, createdBy: req.user._id });
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
    const { isPublished, pricePaise } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid exam id' });
    }

    if (typeof isPublished !== 'boolean' && pricePaise === undefined) {
      return res.status(400).json({ message: 'isPublished or pricePaise is required' });
    }

    if (pricePaise !== undefined && (!Number.isSafeInteger(pricePaise) || pricePaise < 0)) {
      return res.status(400).json({ message: 'pricePaise must be a non-negative integer' });
    }

    const session = await mongoose.startSession();
    let exam;
    try {
      await session.withTransaction(async () => {
        exam = await Exam.findOne({ _id: id, instituteId: req.institute._id }).session(session);
        if (!exam) {
          const err = new Error('Exam not found');
          err.statusCode = 404;
          throw err;
        }

        if (pricePaise !== undefined) exam.pricePaise = pricePaise;
        if (isPublished === true && !exam.isPublished) {
          const { recordPublication } = require('../services/monetizationService');
          await recordPublication({
            instituteId: req.institute._id,
            examId: exam._id,
            userId: req.user._id,
            session,
          });
          exam.isPublished = true;
        } else if (isPublished === false && exam.isPublished) {
          exam.isPublished = false;
        }
        await exam.save({ session });
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      throw error;
    } finally {
      await session.endSession();
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
  getPopularInstitutes,
  importInstituteExam,
  getInstituteExams,
  updateInstituteExam,
  getInstituteResults,
};
