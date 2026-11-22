const mongoose = require('mongoose');
const Product = require('../models/Product');
const Assignment = require('../models/Assignment');
const Repair = require('../models/Repair');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

/**
 * @desc    Issue / Assign equipment to student or faculty
 * @route   POST /api/assignments/issue
 * @access  Public
 */
const issueEquipment = async (req, res, next) => {
  try {
    const {
      equipmentId,
      borrowerName,
      borrowerId,
      borrowerRole,
      department,
      labRoom = 'Lab 301',
      expectedReturnDate,
      remarks = ''
    } = req.body;

    if (!equipmentId || !borrowerName || !borrowerId || !borrowerRole || !department || !expectedReturnDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required assignment fields: equipmentId, borrowerName, borrowerId, borrowerRole, department, expectedReturnDate'
      });
    }

    const filter = isValidObjectId(equipmentId) ? { _id: equipmentId } : { sku: equipmentId.toUpperCase().trim() };
    const equipment = await Product.findOne(filter);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: `Equipment not found with ID/SKU: ${equipmentId}`
      });
    }

    if (equipment.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `Equipment '${equipment.name}' is currently out of stock (Quantity: 0). Cannot issue.`
      });
    }

    if (equipment.status === 'damaged' || equipment.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: `Equipment '${equipment.name}' cannot be issued because it is currently ${equipment.status}.`
      });
    }

    // Create Assignment Record
    const assignment = await Assignment.create({
      equipment: equipment._id,
      equipmentSku: equipment.sku,
      equipmentName: equipment.name,
      borrowerName: borrowerName.trim(),
      borrowerId: borrowerId.trim(),
      borrowerRole,
      department: department.trim(),
      labRoom: labRoom.trim(),
      issueDate: new Date(),
      expectedReturnDate: new Date(expectedReturnDate),
      remarks: remarks.trim()
    });

    // Update Equipment Stock and Status
    equipment.quantity -= 1;
    equipment.totalIssuesCount = (equipment.totalIssuesCount || 0) + 1;
    equipment.assignedTo = {
      borrowerName: borrowerName.trim(),
      borrowerId: borrowerId.trim(),
      borrowerRole,
      department: department.trim(),
      issuedAt: new Date(),
      expectedReturnDate: new Date(expectedReturnDate)
    };

    if (equipment.quantity === 0) {
      equipment.status = 'issued';
    }

    await equipment.save();

    return res.status(201).json({
      success: true,
      message: `Equipment '${equipment.name}' successfully issued to ${borrowerName} (${borrowerRole}).`,
      assignment,
      equipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Return assigned equipment
 * @route   POST /api/assignments/return
 * @access  Public
 */
const returnEquipment = async (req, res, next) => {
  try {
    const { assignmentId, returnCondition = 'Good', remarks = '', repairCost = 0, damageDescription = '' } = req.body;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID is required'
      });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment record not found'
      });
    }

    if (assignment.status === 'Returned') {
      return res.status(400).json({
        success: false,
        message: 'This equipment assignment has already been returned.'
      });
    }

    const equipment = await Product.findById(assignment.equipment);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Associated equipment record not found'
      });
    }

    // Close assignment
    assignment.actualReturnDate = new Date();
    assignment.status = 'Returned';
    assignment.returnCondition = returnCondition;
    if (remarks) assignment.remarks = remarks;
    await assignment.save();

    let autoCreatedRepair = null;

    if (returnCondition === 'Damaged' || returnCondition === 'Needs Maintenance') {
      equipment.condition = 'Damaged';
      equipment.status = returnCondition === 'Damaged' ? 'damaged' : 'maintenance';
      equipment.totalRepairsCount = (equipment.totalRepairsCount || 0) + 1;

      // Automatically create repair log entry
      autoCreatedRepair = await Repair.create({
        equipment: equipment._id,
        equipmentSku: equipment.sku,
        equipmentName: equipment.name,
        category: equipment.category,
        issueDescription: damageDescription || remarks || `Damaged upon return by ${assignment.borrowerName} (${assignment.borrowerId})`,
        damageType: 'Accidental Damage',
        repairCost: Number(repairCost) || 0,
        technician: 'Campus IT Lab Support',
        status: 'Reported'
      });
    } else {
      equipment.quantity += 1;
      equipment.condition = 'Good';
      equipment.status = 'available';
      equipment.assignedTo = {
        borrowerName: null,
        borrowerId: null,
        borrowerRole: 'None',
        department: null,
        issuedAt: null,
        expectedReturnDate: null
      };
    }

    await equipment.save();

    return res.status(200).json({
      success: true,
      message: `Equipment successfully returned. Condition: ${returnCondition}.`,
      assignment,
      equipment,
      repair: autoCreatedRepair
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active assignments
 * @route   GET /api/assignments/active
 * @access  Public
 */
const getActiveAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ status: 'Active' })
      .populate('equipment')
      .sort({ issueDate: -1 });

    const now = new Date();
    const enriched = assignments.map((item) => {
      const isOverdue = new Date(item.expectedReturnDate) < now;
      return {
        ...item.toJSON(),
        isOverdue
      };
    });

    return res.status(200).json({
      count: enriched.length,
      assignments: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all assignment history
 * @route   GET /api/assignments/history
 * @access  Public
 */
const getAssignmentHistory = async (req, res, next) => {
  try {
    const { borrowerId, status } = req.query;
    const query = {};
    if (borrowerId) query.borrowerId = borrowerId.trim();
    if (status) query.status = status;

    const history = await Assignment.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log a new repair / maintenance record
 * @route   POST /api/repairs
 * @access  Public
 */
const logRepair = async (req, res, next) => {
  try {
    const {
      equipmentId,
      issueDescription,
      damageType = 'Component Breakdown',
      repairCost = 0,
      technician = 'Campus IT Lab Support',
      status = 'Reported',
      resolutionNotes = ''
    } = req.body;

    if (!equipmentId || !issueDescription) {
      return res.status(400).json({
        success: false,
        message: 'equipmentId and issueDescription are required'
      });
    }

    const filter = isValidObjectId(equipmentId) ? { _id: equipmentId } : { sku: equipmentId.toUpperCase().trim() };
    const equipment = await Product.findOne(filter);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: `Equipment not found with ID/SKU: ${equipmentId}`
      });
    }

    const repair = await Repair.create({
      equipment: equipment._id,
      equipmentSku: equipment.sku,
      equipmentName: equipment.name,
      category: equipment.category,
      issueDescription: issueDescription.trim(),
      damageType,
      repairCost: Number(repairCost) || 0,
      technician: technician.trim(),
      status,
      resolutionNotes: resolutionNotes.trim()
    });

    // Update equipment stats
    equipment.status = status === 'Completed' ? 'available' : 'maintenance';
    equipment.condition = status === 'Completed' ? 'Good' : 'Under Repair';
    equipment.totalRepairsCount = (equipment.totalRepairsCount || 0) + 1;
    equipment.totalRepairCost = (equipment.totalRepairCost || 0) + (Number(repairCost) || 0);
    if (status === 'Completed') {
      equipment.lastMaintenanceDate = new Date();
    }
    await equipment.save();

    return res.status(201).json({
      success: true,
      message: 'Repair record logged successfully',
      repair,
      equipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark repair as completed / resolved
 * @route   PATCH /api/repairs/:id/resolve
 * @access  Public
 */
const resolveRepair = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes = '', finalCost } = req.body;

    const repair = await Repair.findById(id);
    if (!repair) {
      return res.status(404).json({
        success: false,
        message: `Repair record not found with ID: ${id}`
      });
    }

    repair.status = 'Completed';
    repair.resolvedDate = new Date();
    if (resolutionNotes) repair.resolutionNotes = resolutionNotes.trim();
    if (finalCost !== undefined) repair.repairCost = Number(finalCost);
    await repair.save();

    const equipment = await Product.findById(repair.equipment);
    if (equipment) {
      equipment.status = 'available';
      equipment.condition = 'Good';
      equipment.lastMaintenanceDate = new Date();
      await equipment.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Repair marked as completed. Equipment restored to available state.',
      repair,
      equipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all repair history
 * @route   GET /api/repairs
 * @access  Public
 */
const getAllRepairs = async (req, res, next) => {
  try {
    const { status, sku } = req.query;
    const query = {};
    if (status) query.status = status;
    if (sku) query.equipmentSku = sku.toUpperCase().trim();

    const repairs = await Repair.find(query).sort({ reportedDate: -1 });

    return res.status(200).json({
      count: repairs.length,
      repairs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Equipment Usage Reports (Aggregation Pipeline)
 * @route   GET /api/reports/usage
 * @access  Public
 */
const getUsageReport = async (req, res, next) => {
  try {
    // 1. Department Breakdown Aggregation
    const departmentStats = await Assignment.aggregate([
      {
        $group: {
          _id: '$department',
          totalAssignments: { $sum: 1 },
          activeNow: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          returned: {
            $sum: { $cond: [{ $eq: ['$status', 'Returned'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalAssignments: -1 } }
    ]);

    // 2. Role Breakdown (Student vs Faculty)
    const roleStats = await Assignment.aggregate([
      {
        $group: {
          _id: '$borrowerRole',
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Top Most Assigned Equipment
    const topAssigned = await Assignment.aggregate([
      {
        $group: {
          _id: { sku: '$equipmentSku', name: '$equipmentName' },
          totalIssues: { $sum: 1 }
        }
      },
      { $sort: { totalIssues: -1 } },
      { $limit: 5 }
    ]);

    // 4. Lab Equipment Status Summary
    const statusStats = await Product.aggregate([
      {
        $group: {
          _id: '$status',
          totalUnits: { $sum: '$quantity' },
          distinctEquipment: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      reportGeneratedAt: new Date(),
      departmentStats,
      roleStats,
      topAssigned: topAssigned.map((item) => ({
        sku: item._id.sku,
        name: item._id.name,
        totalIssues: item.totalIssues
      })),
      statusStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Identify Frequently Damaged Equipment (MongoDB Aggregation)
 * @route   GET /api/reports/frequently-damaged
 * @access  Public
 */
const getFrequentlyDamagedReport = async (req, res, next) => {
  try {
    const damagedReport = await Repair.aggregate([
      {
        $group: {
          _id: { sku: '$equipmentSku', name: '$equipmentName', category: '$category' },
          damageCount: { $sum: 1 },
          totalRepairCost: { $sum: '$repairCost' },
          avgRepairCost: { $avg: '$repairCost' },
          lastDamagedDate: { $max: '$reportedDate' },
          damageTypes: { $addToSet: '$damageType' }
        }
      },
      {
        $project: {
          _id: 0,
          sku: '$_id.sku',
          name: '$_id.name',
          category: '$_id.category',
          damageCount: 1,
          totalRepairCost: { $round: ['$totalRepairCost', 2] },
          avgRepairCost: { $round: ['$avgRepairCost', 2] },
          lastDamagedDate: 1,
          damageTypes: 1
        }
      },
      {
        $sort: { damageCount: -1, totalRepairCost: -1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      count: damagedReport.length,
      report: damagedReport
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Feature: Predictive Maintenance Analysis
 *          Analyzes repair logs, failure velocity, usage intensity & economic depreciation
 * @route   GET /api/ai/predictive-maintenance
 * @access  Public
 */
const getPredictiveMaintenanceAI = async (req, res, next) => {
  try {
    const products = await Product.find({});
    const allRepairs = await Repair.find({});
    const allAssignments = await Assignment.find({});

    const analysis = products.map((prod) => {
      const repairs = allRepairs.filter(
        (r) => String(r.equipment) === String(prod._id) || r.equipmentSku === prod.sku
      );
      const assignments = allAssignments.filter(
        (a) => String(a.equipment) === String(prod._id) || a.equipmentSku === prod.sku
      );

      const totalRepairs = repairs.length;
      const totalRepairCost = repairs.reduce((acc, curr) => acc + (curr.repairCost || 0), 0);
      const totalUsageCount = assignments.length;

      // Calculate days since last maintenance or registration
      const now = new Date();
      let lastEventDate = prod.lastMaintenanceDate || prod.createdAt;
      if (repairs.length > 0) {
        const latestRepair = repairs.reduce((latest, r) => (r.reportedDate > latest ? r.reportedDate : latest), repairs[0].reportedDate);
        if (latestRepair > lastEventDate) lastEventDate = latestRepair;
      }

      const daysSinceLastEvent = Math.floor((now - new Date(lastEventDate)) / (1000 * 60 * 60 * 24));

      // Scoring factors (0 - 100)
      let riskScore = 15; // baseline operating wear
      const riskFactors = [];
      const recommendations = [];

      // Factor 1: Failure recurrence velocity (High damage frequency)
      if (totalRepairs >= 4) {
        riskScore += 35;
        riskFactors.push(`High failure frequency: ${totalRepairs} historical repairs logged`);
      } else if (totalRepairs >= 2) {
        riskScore += 20;
        riskFactors.push(`Moderate failure frequency: ${totalRepairs} historical repairs logged`);
      } else if (totalRepairs === 1) {
        riskScore += 10;
        riskFactors.push('1 previous repair logged');
      }

      // Factor 2: Economic Damage Ratio (Cumulative repair cost vs Asset price)
      const costRatio = prod.price > 0 ? (totalRepairCost / prod.price) * 100 : 0;
      if (costRatio >= 50) {
        riskScore += 30;
        riskFactors.push(`Severe economic depreciation: Total repair cost is ${costRatio.toFixed(1)}% of original asset price`);
      } else if (costRatio >= 25) {
        riskScore += 15;
        riskFactors.push(`Noticeable cumulative repair expense: ${costRatio.toFixed(1)}% of asset price`);
      }

      // Factor 3: High utilization stress (Frequent checkouts)
      if (totalUsageCount > 15) {
        riskScore += 20;
        riskFactors.push(`High circulation stress: Issued ${totalUsageCount} times across semesters`);
      } else if (totalUsageCount > 7) {
        riskScore += 10;
        riskFactors.push(`Active usage: Issued ${totalUsageCount} times`);
      }

      // Factor 4: Elapsed operational time without servicing
      if (daysSinceLastEvent > 120 && totalUsageCount > 3) {
        riskScore += 15;
        riskFactors.push(`Overdue for periodic calibration: ${daysSinceLastEvent} days since last inspection`);
      }

      // Factor 5: Category-specific vulnerabilities
      if (prod.category.toLowerCase().includes('projector')) {
        riskScore += 10;
        riskFactors.push('Projector lamp & optical thermal degradation vulnerability');
      } else if (prod.category.toLowerCase().includes('keyboard')) {
        riskScore += 5;
        riskFactors.push('Mechanical contact switch dust & liquid hazard risk');
      }

      // Current condition penalties
      if (prod.condition === 'Damaged' || prod.status === 'damaged') {
        riskScore = Math.max(riskScore, 90);
        riskFactors.unshift('Asset is currently in damaged state');
      } else if (prod.status === 'maintenance') {
        riskScore = Math.max(riskScore, 80);
        riskFactors.unshift('Asset is currently undergoing maintenance');
      }

      // Clamp risk score to 100
      riskScore = Math.min(100, Math.max(5, riskScore));

      // Classify Risk Level & Generate AI Recommendations
      let riskLevel = 'LOW';
      let estimatedDaysToMaintenance = 90;

      if (riskScore >= 75) {
        riskLevel = 'CRITICAL';
        estimatedDaysToMaintenance = Math.max(3, 14 - totalRepairs * 2);
        recommendations.push('Immediate preventive servicing or bench testing required.');
        if (costRatio >= 50) {
          recommendations.push('Decommissioning Advisory: Further repairs exceed asset value. Consider upgrading or replacing.');
        } else {
          recommendations.push('Check power supply units (SMPS), capacitors, and thermal paste.');
        }
      } else if (riskScore >= 50) {
        riskLevel = 'HIGH';
        estimatedDaysToMaintenance = 21;
        recommendations.push('Schedule preventive inspection within the next 2-3 weeks.');
        recommendations.push('Inspect connectors, internal cooling vents, and operational stability.');
      } else if (riskScore >= 25) {
        riskLevel = 'MODERATE';
        estimatedDaysToMaintenance = 45;
        recommendations.push('Standard quarterly checkup recommended.');
        recommendations.push('Monitor borrower return condition closely.');
      } else {
        riskLevel = 'LOW';
        estimatedDaysToMaintenance = 120;
        recommendations.push('Equipment operating within optimal healthy parameters.');
      }

      return {
        equipmentId: prod._id,
        sku: prod.sku,
        name: prod.name,
        category: prod.category,
        currentStatus: prod.status,
        currentCondition: prod.condition,
        riskScore,
        riskLevel,
        failureProbability: `${Math.min(98, Math.round(riskScore * 0.95))}%`,
        estimatedDaysToMaintenance,
        daysSinceLastMaintenance: daysSinceLastEvent,
        totalHistoricalRepairs: totalRepairs,
        totalHistoricalUsage: totalUsageCount,
        totalRepairCost,
        riskFactors,
        recommendations
      };
    });

    // Sort by highest risk first
    analysis.sort((a, b) => b.riskScore - a.riskScore);

    const criticalCount = analysis.filter((a) => a.riskLevel === 'CRITICAL').length;
    const highCount = analysis.filter((a) => a.riskLevel === 'HIGH').length;
    const moderateCount = analysis.filter((a) => a.riskLevel === 'MODERATE').length;
    const lowCount = analysis.filter((a) => a.riskLevel === 'LOW').length;

    return res.status(200).json({
      success: true,
      model: 'SmartLab-PredictiveMaintenance-Engine v2.0',
      generatedAt: new Date(),
      totalAnalyzed: analysis.length,
      overview: {
        criticalCount,
        highCount,
        moderateCount,
        lowCount
      },
      predictions: analysis
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
