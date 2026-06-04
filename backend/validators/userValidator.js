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
    title: z.string().min(1, "Title is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pinCode: z.string().regex(/^[0-9]{5,10}$/, "Invalid ZIP/pin code"),
    country: z.string().min(1, "Country is required"),
    contactNumber: z.string().regex(/^[0-9]{10,15}$/, "Invalid contact number"),
  }),
});

module.exports = {
  updateProfileSchema,
  addAddressSchema: addressSchema,
  updateAddressSchema: addressSchema,
};
