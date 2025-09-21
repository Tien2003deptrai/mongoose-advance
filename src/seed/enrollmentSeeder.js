const mongoose = require('mongoose');
const { connect } = require('../mongoose');
const { Enrollment } = require('../models/enrollment');
const { Course } = require('../models/course');

// Generate sample user IDs (in a real app, these would come from a User collection)
const generateUserIds = count => {
  const userIds = [];
  for (let i = 1; i <= count; i++) {
    // Generate ObjectId-like strings for demo purposes
    userIds.push(new mongoose.Types.ObjectId());
  }
  return userIds;
};

async function seedEnrollments() {
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

    // Drop enrollments collection if exists
    await mongoose.connection.db.dropCollection('enrollments').catch(err => {
      if (err.code !== 26) throw err; // 26 = NamespaceNotFound
    });
    console.log('🗑️  Dropped enrollments collection');

    // Create collection and sync indexes
    await Enrollment.createCollection();
    await Enrollment.syncIndexes();
    console.log('🧭 Indexes synced');

    // Create enrollment data
    const enrollments = [];
    const now = new Date();

    // Each user enrolls in 1-3 courses
    for (const userId of userIds) {
      const courseCount = Math.floor(Math.random() * 3) + 1; // 1-3 courses
      const userCourses = new Set();

      for (let i = 0; i < courseCount; i++) {
        // Ensure user doesn't enroll in the same course twice
        let courseId;
        do {
          courseId = courses[Math.floor(Math.random() * courses.length)]._id;
        } while (userCourses.has(courseId.toString()));

        userCourses.add(courseId.toString());

        // Random enrollment date within the last year
        const daysAgo = Math.floor(Math.random() * 365);
        const enrolledAt = new Date(
          now.getTime() - daysAgo * 24 * 60 * 60 * 1000
        );

        // Most enrollments are active, some are refunded
        const status = Math.random() < 0.9 ? 'active' : 'refund';

        enrollments.push({
          userId,
          courseId,
          enrolledAt,
          status,
        });
      }
    }

    // Insert enrollments
    const inserted = await Enrollment.insertMany(enrollments, {
      ordered: false,
    });
    console.log(`✅ Inserted ${inserted.length} enrollments`);

    // Show sample data
    console.log('\n🔎 Sample enrollments (5):');
    inserted.slice(0, 5).forEach(e => {
      console.log(
        `- User: ${e.userId} | Course: ${e.courseId} | Status: ${e.status} | Enrolled: ${e.enrolledAt.toISOString().split('T')[0]}`
      );
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding enrollments:', err);
    process.exit(1);
  }
}

seedEnrollments();
