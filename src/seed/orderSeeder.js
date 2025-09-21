const mongoose = require('mongoose');
const { connect } = require('../mongoose');
const { Order } = require('../models/order');
const { Course } = require('../models/course');

// Generate sample user IDs
const generateUserIds = count => {
  const userIds = [];
  for (let i = 1; i <= count; i++) {
    userIds.push(new mongoose.Types.ObjectId());
  }
  return userIds;
};

async function seedOrders() {
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Get existing courses
    const courses = await Course.find({}, '_id');
    if (courses.length === 0) {
      console.log('⚠️  No courses found. Please seed courses first.');
      process.exit(1);
    }

    // Generate sample user IDs
    const userIds = generateUserIds(20);

    // Drop orders collection if exists
    await mongoose.connection.db.dropCollection('orders').catch(err => {
      if (err.code !== 26) throw err; // 26 = NamespaceNotFound
    });
    console.log('🗑️  Dropped orders collection');

    // Create collection and sync indexes
    await Order.createCollection();
    await Order.syncIndexes();
    console.log('🧭 Indexes synced');

    // Create order data
    const orders = [];
    const now = new Date();

    // Each user makes 1-2 orders
    for (const userId of userIds) {
      const orderCount = Math.floor(Math.random() * 2) + 1; // 1-2 orders

      for (let i = 0; i < orderCount; i++) {
        // Select a random course
        const course = courses[Math.floor(Math.random() * courses.length)];

        // Random amount based on course price (if available) or random
        const amount = Math.floor(Math.random() * 2000000) + 100000; // 100,000 - 2,000,000 VND

        // Random paid date within the last year
        const daysAgo = Math.floor(Math.random() * 365);
        const paidAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        // Most orders are paid, some are refunded
        const status = Math.random() < 0.9 ? 'paid' : 'refunded';

        orders.push({
          userId,
          courseId: course._id,
          amount,
          status,
          paidAt,
        });
      }
    }

    // Insert orders
    const inserted = await Order.insertMany(orders, { ordered: false });
    console.log(`✅ Inserted ${inserted.length} orders`);

    // Show sample data
    console.log('\n🔎 Sample orders (5):');
    inserted.slice(0, 5).forEach(o => {
      console.log(
        `- User: ${o.userId} | Course: ${o.courseId} | Amount: ${o.amount} VND | Status: ${o.status} | Paid: ${o.paidAt.toISOString().split('T')[0]}`
      );
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding orders:', err);
    process.exit(1);
  }
}

seedOrders();
