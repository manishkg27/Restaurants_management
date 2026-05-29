const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const Feedback = require("./models/Feedback");

    // List all indexes
    const indexes = await Feedback.collection.indexes();
    console.log("Current indexes:", indexes);

    // Drop the problematic old index if it exists
    try {
      await Feedback.collection.dropIndex("user_1_item_1");
      console.log("Dropped old user_1_item_1 index");
    } catch (e) {
      console.log("Old index user_1_item_1 not found or already dropped.");
    }

    // Force Mongoose to sync indexes based on the current schema
    await Feedback.syncIndexes();
    console.log("Indexes synced.");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixIndexes();
