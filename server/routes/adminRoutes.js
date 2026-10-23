const express = require("express");
const {
  importJson,
  getAllResults,
  deleteExam,
  getInstituteApplications,
  reviewInstituteApplication,
} = require("../controllers/adminController");
const protect = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.post("/import-json", protect, adminAuth, importJson);
router.get("/results", protect, adminAuth, getAllResults);
router.delete("/exams/:id", protect, adminAuth, deleteExam);
router.get("/institutes", protect, adminAuth, getInstituteApplications);
router.patch("/institutes/:id", protect, adminAuth, reviewInstituteApplication);

module.exports = router;
