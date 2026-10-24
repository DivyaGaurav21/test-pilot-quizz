const express = require("express");
const {
  registerInstitute,
  getMyInstitute,
  getPopularInstitutes,
  importInstituteExam,
  getInstituteExams,
  updateInstituteExam,
  getInstituteResults,
} = require("../controllers/instituteController");
const protect = require("../middleware/auth");
const approvedInstitute = require("../middleware/approvedInstitute");

const router = express.Router();

router.get("/popular", getPopularInstitutes);
router.use(protect);
router.get("/me", getMyInstitute);
router.post("/register", registerInstitute);
router.get("/me/exams", approvedInstitute, getInstituteExams);
router.post("/me/exams/import-json", approvedInstitute, importInstituteExam);
router.patch("/me/exams/:id", approvedInstitute, updateInstituteExam);
router.get("/me/results", approvedInstitute, getInstituteResults);

module.exports = router;
