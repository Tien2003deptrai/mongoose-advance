// scripts/seedLessons.js
const mongoose = require('mongoose');
const { connect } = require('../mongoose'); // dùng hàm connect() sẵn có của bạn
const { Lesson } = require('../models/lesson');
const { Course } = require('../models/course');

// ====== DỮ LIỆU MẪU ======
const lessonTypes = ['video', 'text', 'quiz', 'assignment', 'live'];
const videoTitles = [
  'Introduction and Overview',
  'Setting Up Development Environment',
  'Basic Concepts and Fundamentals',
  'Core Features Deep Dive',
  'Advanced Techniques',
  'Best Practices and Patterns',
  'Common Pitfalls and Solutions',
  'Performance Optimization',
  'Security Considerations',
  'Testing Strategies',
  'Deployment and Production',
  'Maintenance and Updates',
  'Real-world Examples',
  'Case Study Analysis',
  'Hands-on Practice',
  'Code Review Session',
  'Q&A and Discussion',
  'Project Walkthrough',
  'Troubleshooting Guide',
  'Next Steps and Resources',
];

const textContent = [
  'This lesson covers the fundamental concepts and provides a solid foundation for understanding the topic.',
  'Learn about the key principles and how they apply in real-world scenarios.',
  'Explore advanced techniques and methodologies used by industry professionals.',
  'Understand the best practices and common patterns used in modern development.',
  'Discover how to avoid common mistakes and implement robust solutions.',
  'Master the art of optimization and performance tuning for better results.',
  'Learn about security considerations and how to protect your applications.',
  'Understand testing methodologies and how to ensure code quality.',
  'Explore deployment strategies and production environment management.',
  'Learn about maintenance practices and keeping your systems up-to-date.',
];

const quizQuestions = [
  'What is the primary purpose of this concept?',
  'Which approach would be most effective in this scenario?',
  'What are the key benefits of this methodology?',
  'How would you implement this solution?',
  'What are the potential drawbacks of this approach?',
];

// ====== HELPERS ======
const rand = n => Math.floor(Math.random() * n);
const pick = arr => arr[rand(arr.length)];
const pickMany = (arr, k) => {
  const s = new Set();
  while (s.size < k) s.add(pick(arr));
  return Array.from(s);
};

// random date trong ~2 năm gần đây
const randomDate = () => {
  const now = Date.now();
  const past = now - 1000 * 60 * 60 * 24 * 365 * 2; // 2 năm
  return new Date(past + Math.random() * (now - past));
};

// Generate video URL
const generateVideoUrl = () => {
  const videoIds = [
    'dQw4w9WgXcQ',
    'jNQXAC9IVRw',
    'M7lc1UVf-VE',
    'fJ9rUzIMcZQ',
    'kJQP7kiw5Fk',
  ];
  return `https://www.youtube.com/watch?v=${pick(videoIds)}`;
};

// Generate duration in seconds (5-60 minutes)
const generateDuration = () => {
  return (rand(55) + 5) * 60; // 5-60 minutes
};

async function seedLessons() {
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Lấy danh sách courses để tạo lessons
    const courses = await Course.find({}, '_id').limit(10);
    if (courses.length === 0) {
      console.log('❌ No courses found. Please seed courses first.');
      process.exit(1);
    }

    // Xoá collection cũ nếu có (bỏ qua nếu chưa tồn tại)
    await mongoose.connection.db.dropCollection('lessons').catch(err => {
      if (err.code !== 26) throw err; // 26 = NamespaceNotFound
    });
    console.log('🗑️  Dropped lessons collection');

    // Tạo lại + sync index theo schema hiện tại
    await Lesson.createCollection();
    await Lesson.syncIndexes();
    console.log('🧭 Indexes synced');

    const nowSuffix = Date.now();
    const lessons = [];

    // Tạo lessons cho mỗi course
    for (const course of courses) {
      const lessonCount = rand(15) + 5; // 5-20 lessons per course

      for (let i = 0; i < lessonCount; i++) {
        const title = pick(videoTitles);
        const baseSlug = title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '');

        const type = pick(lessonTypes);
        const isPublished = Math.random() < 0.8; // 80% published
        const isFree = Math.random() < 0.3; // 30% free lessons

        const lesson = {
          title: `${title} - Part ${i + 1}`,
          slug: `${baseSlug}-${course._id}-${i}-${nowSuffix}`,
          courseId: course._id,
          order: i + 1,
          type,
          content: {
            videoUrl: type === 'video' ? generateVideoUrl() : undefined,
            duration: type === 'video' ? generateDuration() : undefined,
            transcript: type === 'video' ? pick(textContent) : undefined,
            description: pick(textContent),
            attachments: Math.random() < 0.3 ? [`attachment-${i}.pdf`] : [],
          },
          isFree,
          isPublished,
          publishedAt: isPublished ? randomDate() : undefined,
          stats: {
            views: rand(1000),
            completions: rand(500),
          },
        };

        lessons.push(lesson);
      }
    }

    const inserted = await Lesson.insertMany(lessons, { ordered: false });
    console.log(`✅ Inserted ${inserted.length} lessons`);

    // Update course lessonCount
    for (const course of courses) {
      const lessonCount = await Lesson.countDocuments({ courseId: course._id });
      await Course.findByIdAndUpdate(course._id, {
        'stats.lessonCount': lessonCount,
      });
    }
    console.log('📊 Updated course lesson counts');

    console.log('\n🔎 Sample (5):');
    inserted.slice(0, 5).forEach(l => {
      console.log(
        `- ${l.title} | ${l.type} | course=${l.courseId} | order=${l.order} | free=${l.isFree} | published=${l.isPublished}`
      );
    });

    // Thống kê
    const stats = await Lesson.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgViews: { $avg: '$stats.views' },
          avgCompletions: { $avg: '$stats.completions' },
        },
      },
    ]);

    console.log('\n📈 Statistics by type:');
    stats.forEach(stat => {
      console.log(
        `- ${stat._id}: ${stat.count} lessons, avg views: ${Math.round(stat.avgViews)}, avg completions: ${Math.round(stat.avgCompletions)}`
      );
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding lessons:', err);
    process.exit(1);
  }
}

seedLessons();
