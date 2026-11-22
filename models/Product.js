const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product/Equipment name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    sku: {
      type: String,
      required: [true, 'SKU / Unique Equipment ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]+$/, 'SKU must only contain alphanumeric characters, hyphens, or underscores']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price / Unit Cost is required'],
      min: [0, 'Price must be a positive number or zero']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      default: 5
    },
    supplier: {
      type: String,
      required: [true, 'Supplier / Vendor is required'],
      trim: true
    },
    // Lab Equipment Specific Fields
    status: {
      type: String,
      enum: {
        values: ['available', 'issued', 'damaged', 'maintenance', 'retired'],
        message: '{VALUE} is not a valid equipment status'
      },
      default: 'available'
    },
    labLocation: {
      type: String,
      default: 'Computer Lab 301',
      trim: true
    },
    serialNumber: {
      type: String,
      default: '',
      trim: true
    },
    condition: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Damaged', 'Under Repair'],
      default: 'Good'
    },
    totalIssuesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRepairsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRepairCost: {
      type: Number,
      default: 0,
      min: 0
    },
    lastMaintenanceDate: {
      type: Date,
      default: null
    },
    assignedTo: {
      borrowerName: { type: String, default: null },
      borrowerId: { type: String, default: null },
      borrowerRole: {
        type: String,
        enum: ['Student', 'Faculty', 'Staff', 'None'],
        default: 'None'
      },
      department: { type: String, default: null },
      issuedAt: { type: Date, default: null },
      expectedReturnDate: { type: Date, default: null }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for stockValue: calculated as price * quantity
productSchema.virtual('stockValue').get(function () {
  return Number(((this.price || 0) * (this.quantity || 0)).toFixed(2));
});

// Virtual helper for low-stock check
productSchema.virtual('isLowStock').get(function () {
  return (this.quantity || 0) <= (this.reorderLevel || 0);
});

// Indexes for high-speed querying, filtering, and reporting
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ quantity: 1, reorderLevel: 1 });
productSchema.index({ status: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
