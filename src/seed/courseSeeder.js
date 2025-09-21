// scripts/seedCourses.js
const mongoose = require('mongoose');
const { connect } = require('../mongoose'); // dùng hàm connect() sẵn có của bạn
const { Course } = require('../models/course');

// ====== DỮ LIỆU MẪU ======
const courseTitles = [
  'Introduction to JavaScript',
  'Advanced Node.js Development',
  'MongoDB for Beginners',
  'Express.js Framework Guide',
  'React Frontend Development',
  'Vue.js Complete Course',
  'Angular Application Building',
  'Python for Data Science',
  'Machine Learning Basics',
  'Deep Learning with TensorFlow',
  'CSS Styling Techniques',
  'HTML Fundamentals',
  'Database Design Principles',
  'RESTful API Development',
  'GraphQL Implementation',
  'Docker Containerization',
  'Kubernetes Orchestration',
  'AWS Cloud Services',
  'Cybersecurity Fundamentals',
  'Mobile App Development',
  'DevOps Practices',
  'Git Version Control',
  'Agile Project Management',
  'UI/UX Design Principles',
  'Software Testing Methods',
];

const languages = ['vi', 'en', 'fr', 'es', 'de'];
const levels = ['beginner', 'intermediate', 'advanced'];
const tagPool = [
  'javascript',
  'node',
  'mongodb',
  'express',
  'react',
  'vue',
  'angular',
  'python',
  'ml',
  'dl',
  'css',
  'html',
  'db',
  'rest',
  'graphql',
  'docker',
  'k8s',
  'aws',
  'security',
  'mobile',
  'devops',
  'git',
  'agile',
  'uiux',
  'testing',
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

async function seedCourses() {
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Xoá collection cũ nếu có (bỏ qua nếu chưa tồn tại)
    await mongoose.connection.db.dropCollection('courses').catch(err => {
      if (err.code !== 26) throw err; // 26 = NamespaceNotFound
    });
    console.log('🗑️  Dropped courses collection');

    // Tạo lại + sync index theo schema hiện tại
    await Course.createCollection();
    await Course.syncIndexes();
    console.log('🧭 Indexes synced');

    const COUNT = 20;
    const nowSuffix = Date.now();

    const docs = Array.from({ length: COUNT }, (_, i) => {
      const title = pick(courseTitles);
      const baseSlug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

      const price = Math.floor(Math.random() * 201) * 1000; // 0..200000
      const level = pick(levels);
      const tags = pickMany(tagPool, rand(4) + 1); // 1..4 tags
      const publishedAt = Math.random() < 0.85 ? randomDate() : null; // 15% chưa publish

      return {
        title,
        slug: `${baseSlug}-${nowSuffix}-${i}`, // unique ổn định
        lang: pick(languages),
        price,
        level,
        tags,
        publishedAt,
        stats: {
          lessonCount: rand(50) + 1, // 1..50
          enrolled: rand(1000), // 0..999
        },
        // createdAt để mặc định Date.now trong schema
      };
    });

    const inserted = await Course.insertMany(docs, { ordered: false });
    console.log(`✅ Inserted ${inserted.length} courses`);

    console.log('\n🔎 Sample (5):');
    inserted.slice(0, 5).forEach(c => {
      console.log(
        `- ${c.title} | ${c.slug} | level=${c.level} | ${c.price} VND | tags=${c.tags.join(',')}`
      );
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding courses:', err);
    process.exit(1);
  }
}

seedCourses();
