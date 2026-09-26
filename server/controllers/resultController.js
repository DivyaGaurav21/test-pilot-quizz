
const mongoose = require('mongoose');
const Result = require('../models/Result');
const User = require('../models/User');
const { generateResultPdf } = require('../services/pdfService');

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

const downloadResultPdf = async (req, res) => {
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

    // req.user already available via protect middleware
    generateResultPdf(result, req.user, res);
  } catch (error) {
    // Agar PDF stream shuru ho chuki hai, headers already sent ho sakte hain
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
    }
    console.error('PDF generation error after headers sent:', error);
  }
};


module.exports = { getResults, getResultById, downloadResultPdf };