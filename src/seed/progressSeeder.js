const mongoose = require('mongoose');
const { connect } = require('../mongoose');
const { Progress } = require('../models/progress');
const { Course } = require('../models/course');
const { Enrollment } = require('../models/enrollment');

async function seedProgress() {
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Get existing courses
    const courses = await Course.find({}, '_id');
    if (courses.length === 0) {
      console.log('⚠️  No courses found. Please seed courses first.');
      process.exit(1);
    }

    // Get existing enrollments
    const enrollments = await Enrollment.find({});
    if (enrollments.length === 0) {
      console.log('⚠️  No enrollments found. Please seed enrollments first.');
      process.exit(1);
    }

    // Drop progress collection if exists
    await mongoose.connection.db.dropCollection('progresses').catch(err => {
      if (err.code !== 26) throw err; // 26 = NamespaceNotFound
    });
    console.log('🗑️  Dropped progresses collection');

    // Create collection and sync indexes
    await Progress.createCollection();
    await Progress.syncIndexes();
    console.log('🧭 Indexes synced');

    // Create progress data
    const progresses = [];
    const now = new Date();

    // For each enrollment, create progress records for lessons
    for (const enrollment of enrollments) {
      // Get a random number of lessons for this course (between 5 and 20)
      const lessonCount = Math.floor(Math.random() * 16) + 5;

      // Create progress for each lesson
      for (let i = 1; i <= lessonCount; i++) {
        // Create a lesson ID
        const lessonId = new mongoose.Types.ObjectId();

        // Random status: most are done, some are incomplete
        const status = Math.random() < 0.8 ? 'done' : 'incomplete';

        // Duration in seconds (between 0 and 3600 seconds - 1 hour)
        const durationSec = Math.floor(Math.random() * 3600);

        // Random update date within the last month
        const daysAgo = Math.floor(Math.random() * 30);
        const updatedAt = new Date(
          now.getTime() - daysAgo * 24 * 60 * 60 * 1000
        );

        progresses.push({
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          lessonId,
          status,
          durationSec,
          updatedAt,
        });
      }
    }

    // Insert progress records
    const inserted = await Progress.insertMany(progresses, { ordered: false });
    console.log(`✅ Inserted ${inserted.length} progress records`);

    // Show sample data
    console.log('\n🔎 Sample progress records (5):');
    inserted.slice(0, 5).forEach(p => {
      console.log(
        `- User: ${p.userId} | Course: ${p.courseId} | Lesson: ${p.lessonId} | Status: ${p.status} | Duration: ${p.durationSec}s | Updated: ${p.updatedAt.toISOString().split('T')[0]}`
      );
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding progress:', err);
    process.exit(1);
  }
}

seedProgress();
