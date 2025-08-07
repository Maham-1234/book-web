const {
  registerRequestSchema,
  loginRequestSchema,
  updateProfileRequestSchema,
  userResponseSchema,
  userListResponseSchema,
} = require('./userSchema');

const {
  createProductRequestSchema,
  updateProductRequestSchema,
  productResponseSchema,
  productListResponseSchema,
} = require('./productSchema');
const {
  createCategoryRequestSchema,
  updateCategoryRequestSchema,
  categoryResponseSchema,
  categoryListResponseSchema,
  nestedCategoryResponseSchema,
} = require('./CategorySchema');
const {
  addItemRequestSchema,
  updateItemRequestSchema,
  cartItemResponseSchema,
} = require('./CartItemSchema');
const {
  createOrderRequestSchema,
  orderResponseSchema,
  orderListResponseSchema,
  orderItemResponseSchema,
} = require('./orderSchema');
const {
  createReviewRequestSchema,
  updateReviewRequestSchema,
  reviewResponseSchema,
  reviewListResponseSchema,
} = require('./reviewSchema');

const {
  uuidParamSchema,
  productParamsSchema,
  reviewParamsSchema,
  orderParamsSchema,
  cartItemParamsSchema,
} = require('./paramsSchema');

module.exports = {
  registerRequestSchema,
  loginRequestSchema,
  updateProfileRequestSchema,
  userResponseSchema,
  userListResponseSchema,

  createReviewRequestSchema,
  updateReviewRequestSchema,
  reviewResponseSchema,
  reviewListResponseSchema,

  createProductRequestSchema,
  updateProductRequestSchema,
  productResponseSchema,
  productListResponseSchema,

  uuidParamSchema,
  productParamsSchema,
  reviewParamsSchema,
  orderParamsSchema,
  cartItemParamsSchema,

  createOrderRequestSchema,
  orderResponseSchema,
  orderListResponseSchema,
  orderItemResponseSchema,

  createCategoryRequestSchema,
  updateCategoryRequestSchema,
  categoryResponseSchema,
  categoryListResponseSchema,
  nestedCategoryResponseSchema,

  addItemRequestSchema,
  updateItemRequestSchema,
  cartItemResponseSchema,
};
