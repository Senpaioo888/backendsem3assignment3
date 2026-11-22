const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockReport,
  getCategorySummary
} = require('../controllers/productController');
const {
  validateProductInput,
  validateStockChange
} = require('../middleware/validateMiddleware');

// Specific reports & aggregation routes MUST be declared before :id
router.get('/low-stock', getLowStockReport);
router.get('/summary', getCategorySummary);

// Standard CRUD endpoints
router.route('/')
  .get(getAllProducts)
  .post(validateProductInput, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

// Safe stock increment/decrement endpoint
router.patch('/:id/stock', validateStockChange, updateStock);

module.exports = router;
