const { Order, OrderItem, Product, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Op } = require('sequelize');

exports.getSalesOverTime = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const sales = await Order.findAll({
      where: {
        status: { [Op.not]: 'cancelled' },
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: [
        [
          sequelize.fn('DATE_TRUNC', 'day', sequelize.col('created_at')),
          'date',
        ],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalSales'],
      ],
      group: ['date'],
      order: [[sequelize.col('date'), 'ASC']],
      raw: true,
    });

    return successResponse(
      res,
      { sales },
      'Sales data retrieved successfully.'
    );
  } catch (error) {
    console.error(`Error fetching sales data: ${error.message}`);
    return errorResponse(res, 'Failed to retrieve sales data.');
  }
};

exports.getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantitySold'],
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name'],
        },
      ],
      group: ['productId', 'product.id', 'product.name'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 5,
    });

    return successResponse(
      res,
      { topProducts },
      'Top selling products retrieved successfully.'
    );
  } catch (error) {
    console.error(`Error fetching top selling products: ${error.message}`);
    return errorResponse(res, 'Failed to retrieve top selling products.');
  }
};
