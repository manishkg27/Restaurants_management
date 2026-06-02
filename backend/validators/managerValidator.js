const { z } = require("zod");

const managerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    contact: z.string().min(1, "Contact is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().optional(),
    bankName: z.string().min(1, "Bank name is required"),
    bankBranch: z.string().min(1, "Bank branch is required"),
    bankIFSC: z.string().min(1, "Bank IFSC is required"),
    bankAccount: z.string().min(1, "Bank account is required"),
  }),
});

module.exports = {
  createManagerSchema: managerSchema,
  updateManagerSchema: managerSchema,
};
