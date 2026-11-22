const Product = require('../models/Product');
const mongoose = require('mongoose');

// Helper to determine if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

/**
 * @desc    Create a new product / lab equipment
 * @route   POST /api/products
 * @access  Public
 */
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products with filtering, sorting, search & pagination
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      category,
      supplier,
      minPrice,
      maxPrice,
      search,
      status
    } = req.query;

    const query = {};

    // Filter by Category (case-insensitive)
    if (category) {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Filter by Supplier (case-insensitive partial match)
    if (supplier) {
      query.supplier = { $regex: new RegExp(supplier.trim(), 'i') };
    }

    // Filter by Equipment Status (available, issued, damaged, maintenance)
    if (status) {
      query.status = status.toLowerCase().trim();
    }

    // Filter by Price Range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Search query (matches name, sku, category, or supplier)
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { category: searchRegex },
        { supplier: searchRegex }
      ];
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOrder = order === 'asc' || order === '1' ? 1 : -1;
    const sortField = sortBy.trim();
    const sortObj = { [sortField]: sortOrder };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || (total === 0 ? 1 : 1);

    return res.status(200).json({
      total,
      page: pageNum,
      totalPages,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID or SKU
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product;

    if (isValidObjectId(id)) {
      product = await Product.findById(id);
    } else {
      // Fallback search by SKU
      product = await Product.findOne({ sku: id.toUpperCase().trim() });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${id}`
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product details
 * @route   PUT /api/products/:id
 * @access  Public
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = isValidObjectId(id) ? { _id: id } : { sku: id.toUpperCase().trim() };

    const updatedProduct = await Product.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${id}`
      });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Public
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = isValidObjectId(id) ? { _id: id } : { sku: id.toUpperCase().trim() };

    const deleted = await Product.findOneAndDelete(filter);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${id}`
      });
    }

    return res.status(200).json({
      message: 'Product deleted',
      id: deleted._id.toString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update stock level (restock or issue/sale)
 * @route   PATCH /api/products/:id/stock
 * @access  Public
 */
const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { change } = req.body;

    const changeNum = Number(change);
    if (isNaN(changeNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid change value. Must be a number.'
      });
    }

    const filter = isValidObjectId(id) ? { _id: id } : { sku: id.toUpperCase().trim() };
    const product = await Product.findOne(filter);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${id}`
      });
    }

    const newQuantity = product.quantity + changeNum;
    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: `Stock update failed. Insufficient stock (current: ${product.quantity}, change: ${changeNum}). Quantity cannot drop below 0.`
      });
    }

    product.quantity = newQuantity;
    await product.save();

    return res.status(200).json({
      message: 'Stock updated',
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Low-Stock Alert Report (quantity <= reorderLevel)
 * @route   GET /api/products/low-stock
 * @access  Public
 */
const getLowStockReport = async (req, res, next) => {
  try {
    const lowStockItems = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).sort({ quantity: 1 });

    return res.status(200).json({
      count: lowStockItems.length,
      lowStockItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Category-wise Inventory Summary (MongoDB Aggregation Pipeline)
 * @route   GET /api/products/summary
 * @access  Public
 */
const getCategorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalStockValue: {
            $sum: { $multiply: ['$price', '$quantity'] }
          },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $project: {
          _id: 1,
          totalItems: 1,
          totalQuantity: 1,
          totalStockValue: 1,
          avgPrice: { $round: ['$avgPrice', 2] }
        }
      },
      {
        $sort: { totalStockValue: -1 }
      }
    ]);

    return res.status(200).json({
      categories: summary.length,
      summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockReport,
  getCategorySummary
};
