const mongoose = require("mongoose");
const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "default_secret_key_change_me", "salt", 32);

function encrypt(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    return text;
  }
}

function decrypt(text) {
  if (!text || !text.includes(":")) return text;
  try {
    const parts = text.split(":");
    const iv = Buffer.from(parts.shift(), "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    return text;
  }
}

const managerSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Manager must be linked to a restaurant"],
      unique: true, // One manager profile per restaurant
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Manager profile must be linked to a user account"],
    },
    name: {
      type: String,
      required: [true, "Manager name is required"],
      maxlength: 100,
    },
    contact: { type: String, required: [true, "Contact is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      maxlength: 300,
    },
    bankName: { type: String, required: [true, "Bank name is required"] },
    bankBranch: { type: String, required: [true, "Bank branch is required"] },
    bankIFSC: { type: String, required: [true, "IFSC code is required"], get: decrypt, set: encrypt },
    bankAccount: { type: String, required: [true, "Bank account is required"], get: decrypt, set: encrypt },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  },
);



module.exports = mongoose.model("Manager", managerSchema);
