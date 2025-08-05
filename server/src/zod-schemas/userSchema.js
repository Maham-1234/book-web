const { z } = require("zod");

const registerRequestSchema = z.object({
  email: z.string().email("A valid email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
});

const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required."),
});

const updateProfileRequestSchema = z
  .object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    avatar: z.string().url().nullable(),
  })
  .partial();

const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.enum(["buyer", "admin"]),
  provider: z.enum(["local", "google"]),
  is_email_verified: z.boolean(),
  is_active: z.boolean(),
  avatar: z.string().url().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

const userListResponseSchema = z.array(userResponseSchema);

module.exports = {
  registerRequestSchema,
  loginRequestSchema,
  updateProfileRequestSchema,
  userResponseSchema,
  userListResponseSchema,
};
