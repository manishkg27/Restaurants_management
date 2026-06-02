const { z } = require("zod");

const restaurantSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().min(1, "Location is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    pinCode: z.string().min(1, "Pin code is required"),
    restaurantContact: z.string().min(1, "Restaurant contact is required"),
    ownerContact: z.string().min(1, "Owner contact is required"),
    ownerName: z.string().min(1, "Owner name is required"),
    ownerEmail: z.string().email("Invalid owner email"),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
});

module.exports = {
  createRestaurantSchema: restaurantSchema,
  updateRestaurantSchema: restaurantSchema,
};
