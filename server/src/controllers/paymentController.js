const stripe = require('../config/stripe');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Cart, CartItem, Product } = require('../models');

exports.createPaymentIntent = async (req, res) => {
  console.log(req.user);
  const { id } = req.user;

  try {
    const cart = await Cart.findOne({
      where: { userId: id },
      include: [{ model: CartItem, as: 'items', include: ['product'] }],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return errorResponse(
        res,
        'Cannot create payment: Your cart is empty.',
        404
      );
    }

    let totalAmount = 0;
    for (const item of cart.items) {
      if (!item.product) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }
      totalAmount += parseFloat(item.product.price) * parseFloat(item.quantity);
    }
    console.log('totalAmount', totalAmount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseFloat((totalAmount * 100).toFixed(2)),
      currency: 'usd',
      metadata: { id, cartId: cart.id },
    });

    return successResponse(
      res,
      { clientSecret: paymentIntent.client_secret },
      'PaymentIntent created successfully.'
    );
  } catch (error) {
    console.error('Error creating PaymentIntent:', error.message);
    return errorResponse(
      res,
      `Failed to create payment intent: ${error.message}`
    );
  }
};
