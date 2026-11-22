const express = require('express');
const router = express.Router();
const {
  issueEquipment,
  returnEquipment,
  getActiveAssignments,
  getAssignmentHistory,
  logRepair,
  resolveRepair,
  getAllRepairs,
  getUsageReport,
  getFrequentlyDamagedReport,
  getPredictiveMaintenanceAI
} = require('../controllers/labController');

// Equipment Assignment & Return Routes
router.post('/assignments/issue', issueEquipment);
router.post('/assignments/return', returnEquipment);
router.get('/assignments/active', getActiveAssignments);
router.get('/assignments/history', getAssignmentHistory);

// Repair History & Maintenance Routes
router.post('/repairs', logRepair);
router.get('/repairs', getAllRepairs);
router.patch('/repairs/:id/resolve', resolveRepair);

// Equipment Usage & Frequently Damaged Reports (Aggregation Pipelines)
router.get('/reports/usage', getUsageReport);
router.get('/reports/frequently-damaged', getFrequentlyDamagedReport);

// AI Feature: Repair Analysis & Predictive Maintenance
router.get('/ai/predictive-maintenance', getPredictiveMaintenanceAI);

module.exports = router;
