const { z } = require("zod");
const { userResponseSchema } = require("./userSchemas");

const baseReviewSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int(),
  comment: z.string().nullable(),
  productId: z.string().uuid(),
  isVerifiedPurchase: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: userResponseSchema.pick({
    id: true,
    first_name: true,
    avatar: true,
  }),
});

const writeReviewRequestSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(10).optional(),
    productId: z.string().uuid(),
  }),
});

const editReviewRequestSchema = z.object({
  params: z.object({
    reviewId: z.string().uuid(),
  }),
  body: z
    .object({
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message:
        "At least one field (rating or comment) must be provided to update",
    }),
});

const deleteReviewRequestSchema = z.object({
  params: z.object({
    reviewId: z.string().uuid(),
  }),
});

const reviewSuccessResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z.object({
    review: baseReviewSchema,
  }),
});

const simpleSuccessResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
});

const writeReviewResponseSchema = reviewSuccessResponseSchema;
const editReviewResponseSchema = reviewSuccessResponseSchema;
const deleteReviewResponseSchema = simpleSuccessResponseSchema;

module.exports = {
  writeReviewRequestSchema,
  editReviewRequestSchema,
  deleteReviewRequestSchema,

  writeReviewResponseSchema,
  editReviewResponseSchema,
  deleteReviewResponseSchema,

  baseReviewSchema,
};
