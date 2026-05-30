const { z } = require("zod");

const placeOrderSchema = z.object({
  body: z.object({
    deliveryInfo: z.object({
      name: z.string().min(1, "Name is required"),
      phone: z.string().min(10, "Phone number is required"),
      email: z.string().email("Invalid email address"),
      address: z.string().min(5, "Address must be at least 5 characters"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      pinCode: z.string().min(1, "Pin code is required"),
    }),
    expectedTotal: z.number().min(0, "Expected total must be a positive number"),
  }),
});

const updateDeliveryStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "pending",
      "confirmed",
      "preparing",
      "out-for-delivery",
      "delivered",
      "cancelled"
    ], { errorMap: () => ({ message: "Invalid delivery status" }) }),
  }),
});

module.exports = {
  placeOrderSchema,
  updateDeliveryStatusSchema,
};
