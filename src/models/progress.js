const { Schema, model } = require('mongoose');

const progressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, required: true, index: true },
    status: {
      type: String,
      enum: ['done', 'incomplete'],
      default: 'incomplete',
      index: true,
    },
    durationSec: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false, timestamps: true }
);

progressSchema.index(
  { courseId: 1, userId: 1, updatedAt: -1 },
  { name: 'course_user_updated' }
);

const Progress = model('Progress', progressSchema);

module.exports = { Progress };
