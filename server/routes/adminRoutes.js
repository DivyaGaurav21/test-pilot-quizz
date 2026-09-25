// import { Router } from 'express';
// import { auth } from '../middleware/auth.js';
// import { adminAuth } from '../middleware/adminAuth.js';
// import { importExam } from '../controllers/adminController.js';

// const router = Router();

// router.post('/exams/import', auth, adminAuth, importExam);

// export default router;

const express = require('express');
const { importJson, getAllResults } = require('../controllers/adminController');
const protect = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.post('/import-json', protect, adminAuth, importJson);
router.get('/results', protect, adminAuth, getAllResults);

module.exports = router;