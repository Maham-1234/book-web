const { z } = require('zod');

const baseRequestSchema = z.object({
  name: z.string().min(3, 'Product name is too short'),
  description: z.string().min(10, 'Description is too short'),
  price: z.number().positive('Price must be a positive number'),
  sku: z.string().min(3, 'SKU is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  categoryId: z.number().int('A valid category ID is required'),
  images: z.array(z.string().url()).optional(),
});

const bookRequestSchema = baseRequestSchema.extend({
  productType: z.literal('book'),
  author: z.string().min(1, 'Author is required for books'),
  isbn: z.string().min(10, 'A valid ISBN is required for books'),
  brand: z.string().nullable().optional(),
});

const stationeryRequestSchema = baseRequestSchema.extend({
  productType: z.literal('stationery'),
  brand: z.string().min(1, 'Brand is required for stationery'),
  author: z.string().nullable().optional(),
  isbn: z.string().nullable().optional(),
});

const createProductRequestSchema = z.discriminatedUnion('productType', [
  bookRequestSchema,
  stationeryRequestSchema,
]);

const updateProductRequestSchema = z.object({
  productType: z.enum(['book', 'stationery']).optional(),
  name: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  sku: z.string().min(3).optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.number().int().optional(),
  images: z.array(z.string().url()).optional(),
  author: z.string().optional(),
  isbn: z.string().optional(),
  brand: z.string().optional(),
});

const productResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  sku: z.string(),
  stock: z.number().int(),
  images: z.array(z.string()),
  productType: z.enum([
    'Books',
    'Stationary',
    'Art_Supply',
    'Journals',
    'Pens',
  ]),
  author: z.string().nullable(),
  isbn: z.string().nullable(),
  brand: z.string().nullable(),
  categoryId: z.string().uuid(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const productListResponseSchema = z.array(productResponseSchema);

module.exports = {
  createProductRequestSchema,
  updateProductRequestSchema,
  productResponseSchema,
  productListResponseSchema,
};
