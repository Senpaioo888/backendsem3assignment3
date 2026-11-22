const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
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
    borrowerName: {
      type: String,
      required: [true, 'Student/Faculty name is required'],
      trim: true
    },
    borrowerId: {
      type: String,
      required: [true, 'Student Roll No / Faculty ID is required'],
      trim: true
    },
    borrowerRole: {
      type: String,
      enum: ['Student', 'Faculty', 'Staff'],
      required: [true, 'Borrower role is required (Student, Faculty, Staff)']
    },
    department: {
      type: String,
      required: [true, 'Department is required (e.g. Computer Science, IT)'],
      trim: true
    },
    labRoom: {
      type: String,
      default: 'Lab 301',
      trim: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    expectedReturnDate: {
      type: Date,
      required: [true, 'Expected return date is required']
    },
    actualReturnDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['Active', 'Returned', 'Overdue'],
      default: 'Active'
    },
    returnCondition: {
      type: String,
      enum: ['Good', 'Damaged', 'Needs Maintenance', 'Lost'],
      default: 'Good'
    },
    remarks: {
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

assignmentSchema.index({ status: 1 });
assignmentSchema.index({ borrowerId: 1 });
assignmentSchema.index({ equipmentSku: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
