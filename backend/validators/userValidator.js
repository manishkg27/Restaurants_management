const { z } = require("zod");

const updateProfileSchema = z.object({
  body: z.object({
    profile: z.object({
      fullName: z.string().optional(),
      phone: z.string().optional(),
      contactNumber: z.string().optional(),
      avatar: z.string().optional(),
    }).optional(),
  }),
});

const addressSchema = z.object({
  body: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pinCode: z.string().min(1, "Pin Code is required"),
    country: z.string().min(1, "Country is required"),
    isDefault: z.boolean().optional(),
  }),
});

module.exports = {
  updateProfileSchema,
  addAddressSchema: addressSchema,
  updateAddressSchema: addressSchema,
};
