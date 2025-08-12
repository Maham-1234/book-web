const { InventoryTransaction, Product, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getProductTransactions = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('productId: ', productId);
    const productExists = await Product.findByPk(productId);
    if (!productExists) {
      return errorResponse(res, 'Product not found.', 404);
    }

    const transactions = await InventoryTransaction.findAll({
      where: { productId },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(
      res,
      { transactions },
      'Inventory transactions retrieved successfully.'
    );
  } catch (error) {
    console.error('Error fetching inventory transactions:', error.message);
    return errorResponse(res, 'Failed to retrieve inventory transactions.');
  }
};

exports.createManualTransaction = async (req, res) => {
  const { productId, type, quantity, reason } = req.body;

  if (!productId || !type || !quantity || !reason) {
    return errorResponse(res, 'Missing required fields.', 400);
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return errorResponse(res, 'Quantity must be a positive number.', 400);
  }
  const allowedReasons = ['restock', 'return', 'damage', 'initial'];
  if (!allowedReasons.includes(reason)) {
    return errorResponse(
      res,
      `Invalid reason. Must be one of: ${allowedReasons.join(', ')}.`,
      400
    );
  }
  if (!['in', 'out'].includes(type)) {
    return errorResponse(res, "Invalid type. Must be 'in' or 'out'.", 400);
  }

  const t = await sequelize.transaction();

  try {
    const product = await Product.findByPk(productId, { transaction: t });

    if (!product) {
      throw new Error('Product not found.');
    }

    if (type === 'in') {
      await product.increment('stock', { by: quantity, transaction: t });
    } else if (type === 'out') {
      if (product.stock < quantity) {
        throw new Error(
          `Not enough stock to record damage. Available: ${product.stock}, Tried to remove: ${quantity}.`
        );
      }
      await product.decrement('stock', { by: quantity, transaction: t });
    }

    const newTransaction = await InventoryTransaction.create(
      {
        productId,
        type,
        quantity,
        reason,
      },
      { transaction: t }
    );

    await t.commit();

    return successResponse(
      res,
      { transaction: newTransaction },
      'Inventory transaction created successfully.',
      201
    );
  } catch (error) {
    await t.rollback();
    console.error('Error creating manual transaction:', error.message);
    return errorResponse(res, error.message, 422); // 422 for Unprocessable Entity
  }
};
