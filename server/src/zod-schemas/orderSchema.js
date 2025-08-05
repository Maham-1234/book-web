const { z } = require("zod");
const { productResponseSchema } = require("./productSchema");

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(2, "A valid country is required"),
});

//order items are generated automatically from the cart by the server
const createOrderRequestSchema = z.object({
  shipping_address: addressSchema,
});

const orderItemResponseSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int(),
  price: z.string(),
  product: productResponseSchema.pick({
    id: true,
    name: true,
    sku: true,
    images: true,
  }),
});

const orderResponseSchema = z.object({
  id: z.string().uuid(),
  order_number: z.string(),
  total_amount: z.string(),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
  shipping_address: addressSchema,
  payment_method: z.string(),
  stripe_payment_id: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  items: z.array(orderItemResponseSchema),
});

const orderListResponseSchema = z.array(orderResponseSchema);

module.exports = {
  createOrderRequestSchema,
  orderResponseSchema,
  orderListResponseSchema,
  orderItemResponseSchema,
};
