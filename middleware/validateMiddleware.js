// Input Validation Middleware

const validateProductInput = (req, res, next) => {
  const { name, sku, category, price, quantity, reorderLevel, supplier } = req.body;

  const missingFields = [];
  if (!name || typeof name !== 'string' || !name.trim()) missingFields.push('name');
  if (!sku || typeof sku !== 'string' || !sku.trim()) missingFields.push('sku');
  if (!category || typeof category !== 'string' || !category.trim()) missingFields.push('category');
  if (price === undefined || price === null || isNaN(Number(price))) missingFields.push('price (valid number)');
  if (quantity === undefined || quantity === null || isNaN(Number(quantity))) missingFields.push('quantity (valid number)');
  if (reorderLevel === undefined || reorderLevel === null || isNaN(Number(reorderLevel))) missingFields.push('reorderLevel (valid number)');
  if (!supplier || typeof supplier !== 'string' || !supplier.trim()) missingFields.push('supplier');

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Validation failed. Required fields missing or invalid: ${missingFields.join(', ')}`
    });
  }

  if (Number(price) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price cannot be negative'
    });
  }

  if (Number(quantity) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity cannot be negative'
    });
  }

  if (Number(reorderLevel) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Reorder level cannot be negative'
    });
  }

  next();
};

const validateStockChange = (req, res, next) => {
  const { change } = req.body;

  if (change === undefined || change === null || isNaN(Number(change))) {
    return res.status(400).json({
      success: false,
      message: 'A numeric "change" field is required in the request body (e.g. { "change": 10 })'
    });
  }

  next();
};

module.exports = {
  validateProductInput,
  validateStockChange
};
