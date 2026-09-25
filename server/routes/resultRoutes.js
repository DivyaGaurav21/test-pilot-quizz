// import { Router } from 'express';
// import { auth } from '../middleware/auth.js';
// import { createResult } from '../controllers/resultController.js';

// const router = Router();

// router.post('/', auth, createResult);

// export default router;

const express = require('express');
const { getResults, getResultById } = require('../controllers/resultController');
const protect = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getResults);
router.get('/:id', protect, getResultById);

module.exports = router;

// Note: GET /:id/pdf will be added here in Phase 6, once pdfService.js
// and its corresponding controller function exist.
