const { z } = require("zod");

const baseUserSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    role: z.enum(["buyer", "admin"]).default("buyer"),
    provider: z.enum(["local", "google"]).default("local"),
    google_id: z.string().nullable().optional(),
    is_email_verified: z.boolean().default(false),
    is_active: z.boolean().default(true),
    avatar: z.string().nullable().optional(),
    created_at: z.string().datetime().or(z.date()),
    updated_at: z.string().datetime().or(z.date()),
  })
  .strip();

const registerRequestSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
  }),
});

const loginRequestSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const updateProfileRequestSchema = z.object({
  body: z
    .object({
      first_name: z.string().min(1).optional(),
      last_name: z.string().min(1).optional(),
    })
    .strip(),
});

const deleteProfileRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid user ID" }),
  }),
});

const userSuccessResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z.object({
    user: baseUserSchema.omit({ google_id: true }),
  }),
});

const simpleSuccessResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
});

module.exports = {
  baseUserSchema,
  registerRequestSchema,
  loginRequestSchema,
  updateProfileRequestSchema,
  deleteProfileRequestSchema,
  userSuccessResponseSchema, // register, login, update profile
  simpleSuccessResponseSchema, // delete profile
};
