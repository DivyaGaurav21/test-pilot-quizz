import api from "./api";

const getSubscription = async () => (await api.get("/finance/institute/subscription")).data;
const requestSubscription = async (plan) =>
  (await api.post("/finance/institute/subscription", { plan })).data;
const getInstituteFinance = async () => (await api.get("/finance/institute/ledger")).data;
const requestPayout = async (amountPaise) =>
  (await api.post("/finance/institute/payouts", { amountPaise })).data;
const requestExamPurchase = async (examId) =>
  (await api.post(`/finance/exams/${examId}/purchases`)).data;

const getMonetizationSettings = async () => (await api.get("/finance/admin/settings")).data;
const updateMonetizationSettings = async (settings) =>
  (await api.put("/finance/admin/settings", settings)).data;
const getFinanceRecords = async () => (await api.get("/finance/admin/records")).data;
const verifySubscription = async (subscriptionId, paymentReference) =>
  (await api.patch(`/finance/admin/subscriptions/${subscriptionId}/verify`, { paymentReference })).data;
const updateSubscriptionStatus = async (subscriptionId, status) =>
  (await api.patch(`/finance/admin/subscriptions/${subscriptionId}/status`, { status })).data;
const verifyPurchase = async (purchaseId, paymentReference) =>
  (await api.patch(`/finance/admin/purchases/${purchaseId}/verify`, { paymentReference })).data;
const addPurchaseAdjustment = async (purchaseId, adjustment) =>
  (await api.post(`/finance/admin/purchases/${purchaseId}/adjustments`, adjustment)).data;
const addSubscriptionAdjustment = async (subscriptionId, adjustment) =>
  (await api.post(`/finance/admin/subscriptions/${subscriptionId}/adjustments`, adjustment)).data;
const updatePayout = async (payoutId, data) =>
  (await api.patch(`/finance/admin/payouts/${payoutId}`, data)).data;

export default {
  getSubscription,
  requestSubscription,
  getInstituteFinance,
  requestPayout,
  requestExamPurchase,
  getMonetizationSettings,
  updateMonetizationSettings,
  getFinanceRecords,
  verifySubscription,
  updateSubscriptionStatus,
  verifyPurchase,
  addPurchaseAdjustment,
  addSubscriptionAdjustment,
  updatePayout,
};
