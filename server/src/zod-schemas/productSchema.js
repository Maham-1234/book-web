const { z } = require("zod");

const baseRequestSchema = z.object({
  name: z.string().min(3, "Product name is too short"),
  description: z.string().min(10, "Description is too short"),
  price: z.number().positive("Price must be a positive number"),
  sku: z.string().min(3, "SKU is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  category_id: z.string().uuid("A valid category ID is required"),
  images: z.array(z.string().url()).optional(),
});

const bookRequestSchema = baseRequestSchema.extend({
  product_type: z.literal("book"),
  author: z.string().min(1, "Author is required for books"),
  isbn: z.string().min(10, "A valid ISBN is required for books"),
  brand: z.string().nullable().optional(),
});

const stationeryRequestSchema = baseRequestSchema.extend({
  product_type: z.literal("stationery"),
  brand: z.string().min(1, "Brand is required for stationery"),
  author: z.string().nullable().optional(),
  isbn: z.string().nullable().optional(),
});

const createProductRequestSchema = z.discriminatedUnion("product_type", [
  bookRequestSchema,
  stationeryRequestSchema,
]);

const updateProductRequestSchema = createProductRequestSchema.partial();

const productResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  sku: z.string(),
  stock: z.number().int(),
  images: z.array(z.string()),
  product_type: z.enum(["book", "stationery", "art_supply", "other"]),
  author: z.string().nullable(),
  isbn: z.string().nullable(),
  brand: z.string().nullable(),
  category_id: z.string().uuid(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

const productListResponseSchema = z.array(productResponsecha);

module.exports = {
  createProductRequestSchema,
  updateProductRequestSchema,
  productResponseSchema,
  productListResponseSchema,
};
