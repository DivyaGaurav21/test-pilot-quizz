const express = require('express');
const {
  getMySubscription,
  requestSubscription,
  createExamPurchase,
  requestInstitutePayout,
  getInstituteFinance,
  getSettingsForAdmin,
  getPublicPlans,
  updateSettings,
  listFinanceRecords,
  verifySubscriptionPayment,
  updateSubscriptionStatus,
  verifyPurchasePayment,
  adjustPurchase,
  adjustSubscription,
  reviewPayoutRequest,
} = require('../controllers/financeController');
const protect = require('../middleware/auth');
const approvedInstitute = require('../middleware/approvedInstitute');
const superAdminAuth = require('../middleware/superAdminAuth');

const router = express.Router();

router.get('/plans', getPublicPlans);
router.post('/exams/:id/purchases', protect, createExamPurchase);
router.patch('/admin/purchases/:id/verify', protect, superAdminAuth, verifyPurchasePayment);
router.post('/admin/purchases/:id/adjustments', protect, superAdminAuth, adjustPurchase);
router.post('/admin/subscriptions/:id/adjustments', protect, superAdminAuth, adjustSubscription);
router.get('/admin/settings', protect, superAdminAuth, getSettingsForAdmin);
router.put('/admin/settings', protect, superAdminAuth, updateSettings);
router.get('/admin/records', protect, superAdminAuth, listFinanceRecords);
router.patch('/admin/subscriptions/:id/verify', protect, superAdminAuth, verifySubscriptionPayment);
router.patch('/admin/subscriptions/:id/status', protect, superAdminAuth, updateSubscriptionStatus);
router.patch('/admin/payouts/:id', protect, superAdminAuth, reviewPayoutRequest);
router.get('/institute/subscription', protect, approvedInstitute, getMySubscription);
router.post('/institute/subscription', protect, approvedInstitute, requestSubscription);
router.get('/institute/ledger', protect, approvedInstitute, getInstituteFinance);
router.post('/institute/payouts', protect, approvedInstitute, requestInstitutePayout);

module.exports = router;
