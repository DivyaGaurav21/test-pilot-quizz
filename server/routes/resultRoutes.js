const express = require('express');
const { getResults, getResultById, downloadResultPdf } = require('../controllers/resultController');
const protect = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getResults);
router.get('/:id', protect, getResultById);
router.get('/:id/pdf', protect, downloadResultPdf);

module.exports = router;
  