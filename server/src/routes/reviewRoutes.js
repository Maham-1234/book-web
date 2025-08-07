const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const validate = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/auth');

const {
  createReviewRequestSchema,
  updateReviewRequestSchema,
  reviewParamsSchema,
  productParamsSchema,
} = require('../zod-schemas');

router.get(
  '/product/:productId',
  validate({ params: productParamsSchema }),
  reviewController.getProductReviews
);

router.use(isAuthenticated);

router.post(
  '/',
  validate({ body: createReviewRequestSchema }),
  reviewController.createReview
);

router.put(
  '/:reviewId',
  validate({ params: reviewParamsSchema, body: updateReviewRequestSchema }),
  reviewController.updateReview
);

router.delete(
  '/:reviewId',
  validate({ params: reviewParamsSchema }),
  reviewController.deleteReview
);

module.exports = router;
