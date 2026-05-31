const mongoose = require('mongoose');
require('dotenv').config({path: '/home/manish/Desktop/Restaurants Management/backend/.env'});
const Order = require('/home/manish/Desktop/Restaurants Management/backend/models/Order');
const Feedback = require('/home/manish/Desktop/Restaurants Management/backend/models/Feedback');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");
  const feedbacks = await Feedback.find().lean();
  console.log("Feedbacks count:", feedbacks.length);
  if(feedbacks.length > 0) {
    const f = feedbacks[0];
    console.log("Example Feedback:", f);
    
    const userId = f.user;
    
    // Test logic from orderService
    const orders = await Order.aggregate([
      { $match: { user: userId } },
      { $lookup: { from: "orderitems", localField: "_id", foreignField: "order", as: "items" } },
      { $project: {
          items: { _id: 1, item: 1, itemName: 1 },
      } },
      { $limit: 1 }
    ]);
    
    const orderIds = orders.map(o => o._id);
    const userFeedbacks = await Feedback.find({
      order: { $in: orderIds },
      user: userId
    }).lean();
    
    const reviewedMap = {};
    userFeedbacks.forEach(fb => {
      reviewedMap[`${fb.order.toString()}_${fb.item.toString()}`] = true;
    });
    
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          item.hasReviewed = !!reviewedMap[`${order._id.toString()}_${item.item.toString()}`];
        });
      }
    });
    
    console.log("Order items after:", JSON.stringify(orders[0].items, null, 2));
  }
  process.exit(0);
}
test();
