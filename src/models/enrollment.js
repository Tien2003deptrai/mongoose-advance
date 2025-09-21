const { Schema, model } = require('mongoose');

const enrollmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, required: true, index: true },
    enrolledAt: { type: Date, default: Date.now, index: true },
    status: {
      type: String,
      enum: ['active', 'refund'],
      default: 'active',
      index: true,
    },
  },
  { versionKey: false, timestamps: true }
);

enrollmentSchema.index(
  { courseId: 1, enrolledAt: -1 },
  { name: 'course_enrolled_at' }
);

const Enrollment = model('Enrollment', enrollmentSchema);

module.exports = { Enrollment };
