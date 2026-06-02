const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["customer", "owner", "manager"]).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

const setupManagerSchema = z.object({
  body: z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  setupManagerSchema,
};
