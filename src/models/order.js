const { Schema, model } = require('mongoose');

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, required: true, index: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['paid', 'refunded'],
      default: 'paid',
      index: true,
    },
    paidAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false, timestamps: true }
);

orderSchema.index(
  { paidAt: -1, status: 1, courseId: 1 },
  { name: 'paid_status_course' }
);

const Order = model('Order', orderSchema);

module.exports = { Order };
