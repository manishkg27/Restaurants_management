const mongoose = require('mongoose');
const User = require('./models/User');
const Cart = require('./models/Cart');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({ email: 'manish@gmail.com' });
  if (users.length === 0) { console.log('User not found'); process.exit(0); }
  const user = users[0];
  console.log('UserId:', user._id);
  
  const cartFind = await Cart.find({ user: user._id });
  console.log('Find:', cartFind.length);
  
  process.exit(0);
}
run();
