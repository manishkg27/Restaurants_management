const { z } = require("zod");

const addToCartSchema = z.object({
  body: z.object({
    itemId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid item ID"),
  }),
});

const updateCartQuantitySchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1).max(50),
  }),
});

module.exports = {
  addToCartSchema,
  updateCartQuantitySchema,
};
