const mongoose = require('mongoose');
require('dotenv').config({path: '/home/manish/Desktop/Restaurants Management/backend/.env'});
const Order = require('/home/manish/Desktop/Restaurants Management/backend/models/Order');
const Feedback = require('/home/manish/Desktop/Restaurants Management/backend/models/Feedback');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const orderService = require('/home/manish/Desktop/Restaurants Management/backend/services/orderService');
  
  // Find a user who has feedbacks
  const fb = await Feedback.findOne().lean();
  if (!fb) {
      console.log("No feedback");
      process.exit(0);
  }
  
  console.log("Found feedback for user:", fb.user);
  const orders = await orderService.getMyOrders(fb.user, "delivered"); // Try delivered
  const orderWithReview = orders.find(o => o.items.some(i => i.hasReviewed === true));
  
  if (orderWithReview) {
      console.log("Delivered Tab - hasReviewed is TRUE for item:", orderWithReview.items.find(i => i.hasReviewed));
  } else {
      console.log("Delivered Tab - hasReviewed is FALSE for all items");
  }

  const activeOrders = await orderService.getMyOrders(fb.user, "current"); // Try current
  const activeOrderWithReview = activeOrders.find(o => o.items.some(i => i.hasReviewed === true));
  if (activeOrderWithReview) {
      console.log("Current Tab - hasReviewed is TRUE for item:", activeOrderWithReview.items.find(i => i.hasReviewed));
  } else {
      console.log("Current Tab - hasReviewed is FALSE for all items");
  }

  process.exit(0);
}
test();
