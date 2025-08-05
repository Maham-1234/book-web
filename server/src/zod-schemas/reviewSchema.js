const { z } = require("zod");
const { userResponseSchema } = require("./userSchema");

const createReviewRequestSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be 1-5")
    .max(5, "Rating must be 1-5"),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .optional(),
  product_id: z.string().uuid("A valid product ID is required"),
});

const updateReviewRequestSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(10),
  })
  .partial()
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "Either a rating or a comment must be provided to update.",
  });

const reviewResponseSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int(),
  comment: z.string().nullable(),
  is_verified_purchase: z.boolean(),
  product_id: z.string().uuid(),
  created_at: z.date(),
  updated_At: z.date(),
  user: userResponseSchema.pick({
    id: true,
    first_name: true,
  }),
});

const reviewListResponseSchema = z.array(reviewResponseSchema);

module.exports = {
  createReviewRequestSchema,
  updateReviewRequestSchema,
  reviewResponseSchema,
  reviewListResponseSchema,
};
