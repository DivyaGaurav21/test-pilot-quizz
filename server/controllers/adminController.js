const { validateExamJson, importExam } = require('../services/examImportService');
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Question = require('../models/Question')
const Result = require('../models/Result');
const Institute = require('../models/Institute');
const User = require('../models/User');
const FinancialLedgerEntry = require('../models/FinancialLedgerEntry');
const MonetizationSettings = require('../models/MonetizationSettings');

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
      .sort({ submittedAt: -1 })
      .limit(100);

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
};

const getAdminOverview = async (req, res) => {
  try {
    const instituteOwnerIds = await Institute.distinct('ownerId');
    const [studentCount, publishedExamCount, resultCount, entriesByType, settings] = await Promise.all([
      User.countDocuments({ role: 'user', _id: { $nin: instituteOwnerIds } }),
      Exam.countDocuments({ isPublished: true }),
      Result.countDocuments(),
      FinancialLedgerEntry.aggregate([
        { $group: { _id: '$type', totalPaise: { $sum: '$amountPaise' } } },
      ]),
      MonetizationSettings.findById('platform').select('currency'),
    ]);
    const totals = Object.fromEntries(entriesByType.map(({ _id, totalPaise }) => [_id, totalPaise]));
    const subscriptionRevenuePaise = totals.subscription_payment || 0;
    const platformCommissionPaise = totals.platform_commission || 0;

    return res.status(200).json({
      studentCount,
      publishedExamCount,
      resultCount,
      currency: settings?.currency || 'INR',
      examSalesPaise: totals.purchase || 0,
      subscriptionRevenuePaise,
      platformCommissionPaise,
      platformRevenuePaise: subscriptionRevenuePaise + platformCommissionPaise,
      instituteRevenuePaise: totals.institute_share || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin overview', error: error.message });
  }
};

const getAdminStudents = async (req, res) => {
  try {
    const instituteOwnerIds = await Institute.distinct('ownerId');
    const students = await User.find({ role: 'user', _id: { $nin: instituteOwnerIds } })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(100);
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch student details', error: error.message });
  }
};

const getInstituteApplications = async (req, res) => {
  try {
    const statuses = ['pending', 'approved', 'rejected', 'suspended'];
    const status = req.query.status;
    const filter = {};

    if (status !== undefined) {
      if (!statuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid institute status filter' });
      }
      filter.status = status;
    }

    const institutes = await Institute.find(filter)
      .populate('ownerId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(institutes);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch institute applications', error: error.message });
  }
};

const reviewInstituteApplication = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason = '' } = req.body || {};
  const allowedStatuses = ['approved', 'rejected', 'suspended'];

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid institute id' });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status must be approved, rejected, or suspended' });
  }

  if (typeof rejectionReason !== 'string') {
    return res.status(400).json({ message: 'rejectionReason must be a string' });
  }

  try {
    const institute = await Institute.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          rejectionReason: status === 'rejected' ? rejectionReason.trim() : '',
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ).populate('ownerId', 'name email').populate('reviewedBy', 'name email');

    if (!institute) {
      return res.status(404).json({ message: 'Institute application not found' });
    }

    return res.status(200).json(institute);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to review institute application', error: error.message });
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


module.exports = {
  importJson,
  getAllResults,
  getAdminOverview,
  getAdminStudents,
  getInstituteApplications,
  reviewInstituteApplication,
  deleteExam,
};
