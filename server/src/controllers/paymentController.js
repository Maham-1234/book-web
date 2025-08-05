// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const { Order } = require('../models');
// const { errorResponse } = require('../utils/responseHandler');

// exports.createPaymentIntent = async (req, res) => {
//   try {
//     const { orderId } = req.body;
//     const userId = req.user.id;

//     const order = await Order.findOne({ where: { id: orderId, userId: userId } });

//     if (!order) {
//       return errorResponse(res, 'Order not found.', 404);
//     }
//     if (order.status !== 'pending') {
//       return errorResponse(res, 'This order has already been processed.', 422);
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(order.totalAmount * 100),
//       currency: 'usd', 
//       automatic_payment_methods: {
//         enabled: true,
//       },
//       metadata: {
//         orderId: order.id,
//       },
//     });
    
//     order.stripePaymentId = paymentIntent.id;
//     await order.save();

//     res.send({
//       clientSecret: paymentIntent.client_secret,
//     });

//   } catch (error) {
//     return errorResponse(res, 'Failed to create payment intent.');
//   }
// };