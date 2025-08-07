const {
  sequelize,
  User,
  Cart,
  CartItem,
  Product,
  Order,
  OrderItem,
} = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress } = req.body;
  const t = await sequelize.transaction();

  try {
    // 1. Find the user's cart and all its items, including the product details for each item.
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
            },
          ],
        },
      ],
      transaction: t,
    });

    // 2. Validate the cart and its contents
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty.');
    }

    let totalAmount = 0;
    const orderItemsData = [];

    // 3. Loop through cart items to check stock and calculate the total amount.
    for (const item of cart.items) {
      if (!item.product) {
        throw new Error(
          `A product in your cart (ID: ${item.productId}) could not be found.`
        );
      }
      if (item.product.stock < item.quantity) {
        throw new Error(
          `Not enough stock for "${item.product.name}". Available: ${item.product.stock}, In Cart: ${item.quantity}.`
        );
      }
      const itemPrice = item.quantity * item.product.price;
      totalAmount += itemPrice;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    // 4. Create the main Order record.
    const order = await Order.create(
      {
        userId,
        shippingAddress,
        totalAmount,
        status: 'pending',
      },
      { transaction: t }
    );

    // 5. Add the orderId to each item and bulk-create the OrderItem records.
    const itemsWithOrderId = orderItemsData.map((item) => ({
      ...item,
      orderId: order.id,
    }));
    await OrderItem.bulkCreate(itemsWithOrderId, {
      transaction: t,
      individualHooks: true,
    });

    // 6. Update stock levels for each product.
    for (const item of cart.items) {
      await item.product.decrement('stock', {
        by: item.quantity,
        transaction: t,
      });
    }

    // 7. Clear the user's cart.
    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();

    const finalOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    return successResponse(
      res,
      { order: finalOrder },
      'Order created successfully.',
      201
    );
  } catch (error) {
    await t.rollback();
    return errorResponse(res, error.message, 422);
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Product, as: 'product', attributes: ['name', 'images'] },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return successResponse(
      res,
      { orders },
      'User orders retrieved successfully.'
    );
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve user orders.');
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { id: orderId, userId: userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    if (!order) {
      return errorResponse(res, 'Order not found.', 404);
    }

    return successResponse(res, { order }, 'Order retrieved successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve order.');
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { count, rows } = await Order.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: offset,
    });

    return successResponse(
      res,
      {
        orders: rows,
        totalOrders: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page, 10),
      },
      'All orders retrieved successfully.'
    );
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve all orders.');
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !['pending', 'paid', 'shipped', 'delivered', 'cancelled'].includes(status)
    ) {
      return errorResponse(res, 'Invalid status value provided.', 400);
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return errorResponse(res, 'Order not found.', 404);
    }

    order.status = status;
    await order.save();
    //email

    return successResponse(
      res,
      { order },
      'Order status updated successfully.'
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
