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
  orderId: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
    message: "Order ID must be a number",
  }),
});

const cartItemParamsSchema = z.object({
  itemId: z.string().uuid("The Cart Item ID in the URL is not a valid UUID."),
});

const integerIdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer."),
});

module.exports = {
  uuidParamSchema,
  productParamsSchema,
  reviewParamsSchema,
  orderParamsSchema,
  cartItemParamsSchema,
  integerIdParamSchema,
};
