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

//=======================Request=======================================

const registerRequestSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    // confirmPassword: z.string(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
  }),
});

const loginRequestSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password is required"),
  }),
});

const updateProfileRequestSchema = z.object({
  body: z
    .object({
      first_name: z.string().min(1).optional(),
      last_name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      currentPassword: z.string().min(6).optional(),
      newPassword: z.string().min(6).optional(),
    })
    .strip(),
});

const uploadAvatarRequestSchema = z.object({
  body: z.object({
    filename: z.string(),
  }),
});

const deleteProfileRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid user ID" }),
  }),
});

//==========================Response Schema==============================

const successResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string().optional(),
  data: z
    .object({
      user: baseUserSchema,
    })
    .optional(),
});

// For delete profile response (no user data)
const deleteProfileResponseSchema = successResponseSchema.extend({
  data: z.undefined(),
});

module.exports = {
  registerRequestSchema,
  loginRequestSchema,
  updateProfileRequestSchema,
  uploadAvatarRequestSchema,
  deleteProfileRequestSchema,
  successResponseSchema,
  deleteProfileResponseSchema,
  baseUserSchema,
};
