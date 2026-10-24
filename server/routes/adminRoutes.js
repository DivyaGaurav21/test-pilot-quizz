const express = require("express");
const {
  importJson,
  getAllResults,
  getAdminOverview,
  getAdminStudents,
  deleteExam,
  getInstituteApplications,
  reviewInstituteApplication,
} = require("../controllers/adminController");
const protect = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const superAdminAuth = require("../middleware/superAdminAuth");

const router = express.Router();

router.get("/overview", protect, adminAuth, getAdminOverview);
router.get("/students", protect, adminAuth, getAdminStudents);
router.post("/import-json", protect, adminAuth, importJson);
router.get("/results", protect, adminAuth, getAllResults);
router.delete("/exams/:id", protect, adminAuth, deleteExam);
router.get("/institutes", protect, superAdminAuth, getInstituteApplications);
router.patch(
  "/institutes/:id",
  protect,
  superAdminAuth,
  reviewInstituteApplication,
);

module.exports = router;
