const { Schema, model } = require('mongoose');

const courseSchema = new Schema(
  {
    title: { type: String, required: true, index: 'text' },
    slug: { type: String, required: true, unique: true },
    lang: { type: String, default: 'vi' },
    price: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      index: true,
    },
    tags: [{ type: String, index: true }],
    publishedAt: { type: Date, index: true },
    stats: {
      lessonCount: { type: Number, default: 0 },
      enrolled: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

courseSchema.index(
  { level: 1, publishedAt: -1, _id: -1 },
  { name: 'lvl_pub_id' }
);
courseSchema.index(
  { tags: 1, publishedAt: -1, _id: -1 },
  { name: 'tags_pub_id' }
);

const Course = model('Course', courseSchema);

module.exports = { Course };
