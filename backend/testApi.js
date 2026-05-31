const mongoose = require('mongoose');
require('dotenv').config({path: '/home/manish/Desktop/Restaurants Management/backend/.env'});
const Order = require('/home/manish/Desktop/Restaurants Management/backend/models/Order');
const Feedback = require('/home/manish/Desktop/Restaurants Management/backend/models/Feedback');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const userFeedback = await Feedback.find().sort({createdAt: -1}).limit(1).lean();
  if (!userFeedback.length) {
      console.log("No feedbacks");
      process.exit(0);
  }
  const f = userFeedback[0];
  console.log("Latest Feedback:", f);
  
  const orderService = require('/home/manish/Desktop/Restaurants Management/backend/services/orderService');
  
  const order = await Order.findById(f.order).lean();
  console.log("Feedback order paymentStatus:", order.paymentStatus, "deliveryStatus:", order.deliveryStatus);
  
  let status = "current";
  if (order.deliveryStatus === "delivered" || order.deliveryStatus === "cancelled" || (order.paymentStatus && order.deliveryStatus === "delivered")) {
      status = "delivered";
  }
  
  const orders = await orderService.getMyOrders(f.user, status);
  const foundOrder = orders.find(o => o._id.toString() === f.order.toString());
  
  if (foundOrder) {
      console.log("Found order items:", JSON.stringify(foundOrder.items, null, 2));
  } else {
      console.log("Order not found in status:", status);
  }

  process.exit(0);
}
test();
