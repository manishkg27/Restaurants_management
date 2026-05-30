require("dotenv").config();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function test() {
  try {
    const order = await razorpay.orders.create({
      amount: 50000, // 500 INR
      currency: "INR",
      receipt: "test_receipt_123",
    });
    console.log("SUCCESS:", order.id);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

test();
