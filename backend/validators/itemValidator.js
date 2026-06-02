const { z } = require("zod");

const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Item name is required"),
    description: z.string().optional(),
    price: z.coerce.number().positive("Price must be positive"),
    isVegetarian: z.union([z.boolean(), z.string().transform(val => val === 'true')]),
  }),
});

const updateItemSchema = createItemSchema;

module.exports = {
  createItemSchema,
  updateItemSchema,
};
