const { z } = require('zod');

const registerRequestSchema = z.object({
  email: z.string().email('A valid email is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
});

const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

const updateProfileRequestSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    avatar: z.string().url().nullable(),
  })
  .partial();

const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['buyer', 'admin']),
  provider: z.enum(['local', 'google']),
  isEmailVerified: z.boolean(),
  isActive: z.boolean(),
  avatar: z.string().url().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const userListResponseSchema = z.array(userResponseSchema);

module.exports = {
  registerRequestSchema,
  loginRequestSchema,
  updateProfileRequestSchema,
  userResponseSchema,
  userListResponseSchema,
};
