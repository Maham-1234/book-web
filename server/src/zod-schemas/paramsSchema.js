const { z } = require("zod");

const uuidParamSchema = z.object({
  id: z.string().uuid("The ID in the URL is not a valid UUID."),
});

const productParamsSchema = z.object({
  productId: z.string().uuid("The Product ID in the URL is not a valid UUID."),
});

const reviewParamsSchema = z.object({
  reviewId: z.string().uuid("The Review ID in the URL is not a valid UUID."),
});

const orderParamsSchema = z.object({
  orderId: z.string().uuid("The Order ID in the URL is not a valid UUID."),
});

const cartItemParamsSchema = z.object({
  itemId: z.string().uuid("The Cart Item ID in the URL is not a valid UUID."),
});

module.exports = {
  uuidParamSchema,
  productParamsSchema,
  reviewParamsSchema,
  orderParamsSchema,
  cartItemParamsSchema,
};
