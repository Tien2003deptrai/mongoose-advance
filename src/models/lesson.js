const { Schema, model } = require('mongoose');

const lessonSchema = new Schema(
  {
    title: { type: String, required: true, index: 'text' },
    slug: { type: String, required: true, unique: true },
    courseId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
      index: true,
    },
    order: { type: Number, required: true, index: true },
    type: {
      type: String,
      enum: ['video', 'text', 'quiz', 'assignment', 'live'],
      default: 'video',
      index: true,
    },
    content: {
      videoUrl: { type: String },
      duration: { type: Number }, // in seconds
      transcript: { type: String },
      description: { type: String },
      attachments: [{ type: String }], // file URLs
    },
    isFree: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, index: true },
    stats: {
      views: { type: Number, default: 0 },
      completions: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Compound indexes for better query performance
lessonSchema.index({ courseId: 1, order: 1 }, { name: 'course_order' });

lessonSchema.index(
  { courseId: 1, isPublished: 1, order: 1 },
  { name: 'course_published_order' }
);

lessonSchema.index({ type: 1, isPublished: 1 }, { name: 'type_published' });

lessonSchema.index({ isFree: 1, isPublished: 1 }, { name: 'free_published' });

const Lesson = model('Lesson', lessonSchema);

module.exports = { Lesson };
