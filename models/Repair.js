const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Equipment reference is required']
    },
    equipmentSku: {
      type: String,
      required: [true, 'Equipment SKU is required'],
      trim: true
    },
    equipmentName: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    issueDescription: {
      type: String,
      required: [true, 'Issue / fault description is required'],
      trim: true
    },
    damageType: {
      type: String,
      enum: [
        'Wear and Tear',
        'Accidental Damage',
        'Electrical Failure',
        'Component Breakdown',
        'Software/Firmware Issue',
        'Other'
      ],
      default: 'Component Breakdown'
    },
    repairCost: {
      type: Number,
      required: [true, 'Repair cost is required'],
      min: [0, 'Repair cost cannot be negative'],
      default: 0
    },
    technician: {
      type: String,
      default: 'Campus IT Lab Support',
      trim: true
    },
    status: {
      type: String,
      enum: ['Reported', 'In Progress', 'Completed', 'Unrepairable'],
      default: 'Reported'
    },
    reportedDate: {
      type: Date,
      default: Date.now
    },
    resolvedDate: {
      type: Date,
      default: null
    },
    resolutionNotes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

repairSchema.index({ equipmentSku: 1 });
repairSchema.index({ status: 1 });
repairSchema.index({ reportedDate: -1 });

const Repair = mongoose.model('Repair', repairSchema);

module.exports = Repair;
