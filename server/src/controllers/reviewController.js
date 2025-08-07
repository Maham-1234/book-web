const { Review, Order, OrderItem, Product, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) {
      return errorResponse(res, 'Product not found.', 404);
    }

    const reviews = await Review.findAll({
      where: { productId: productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, { reviews }, 'Reviews retrieved successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve reviews.');
  }
};

exports.createReview = async (req, res) => {
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;

  try {
    const existingReview = await Review.findOne({
      where: { userId: userId, productId: productId },
    });
    if (existingReview) {
      return errorResponse(res, 'You have already reviewed this product.', 422);
    }

    const hasPurchased = await Order.findOne({
      where: {
        userId: userId,
        status: 'delivered',
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          where: { productId: productId },
          required: true,
        },
      ],
    });

    const newReview = await Review.create({
      userId: userId,
      productId: productId,
      rating,
      comment,
      isVerifiedPurchase: !!hasPurchased,
    });

    return successResponse(
      res,
      { review: newReview },
      'Thank you for your review!',
      201
    );
  } catch (error) {
    return errorResponse(res, 'Failed to create review.');
  }
};

exports.updateReview = async (req, res) => {
  const userId = req.user.id;
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  try {
    const review = await Review.findOne({
      where: { id: reviewId, userId: userId },
    });
    if (!review) {
      return errorResponse(
        res,
        'Review not found or you do not have permission to edit it.',
        404
      );
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    return successResponse(res, { review }, 'Review updated successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to update review.');
  }
};

exports.deleteReview = async (req, res) => {
  const userId = req.user.id;
  const { reviewId } = req.params;

  try {
    const review = await Review.findOne({ where: { id: reviewId, userId } });
    if (!review) {
      return errorResponse(
        res,
        'Review not found or you do not have permission to delete it.',
        404
      );
    }

    await review.destroy();

    return successResponse(res, null, 'Review has been deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete review.');
  }
};
