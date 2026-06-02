const { z } = require("zod");

const submitFeedbackSchema = z.object({
  body: z.object({
    itemId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid item ID"),
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid order ID"),
    rating: z.number().min(1).max(5),
    experience: z.string().optional(),
  }),
});

const updateFeedbackSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    experience: z.string().optional(),
  }),
});

module.exports = {
  submitFeedbackSchema,
  updateFeedbackSchema,
};
