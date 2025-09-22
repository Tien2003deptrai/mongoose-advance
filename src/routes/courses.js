const router = require('express').Router();

const { asyncRoute } = require('@uniresp/server-express');
const { Course } = require('../models/course');
const { ok } = require('@uniresp/core');
const { Enrollment } = require('../models/enrollment');

// Aggregation

// assignment
router.get(
  '/ex1',
  asyncRoute(async (req, res) => {
    const items = await Course.find({
      level: { $in: ['beginner', 'advanced'] },
    })
      .sort({ publishedAt: -1, _id: -1 })
      .limit(5)
      .explain('executionStats')
      .lean();
    res.json(ok(items, { message: 'Lấy danh sách khoá học thành công (ex1)' }));
  })
);

router.get(
  '/ex2',
  asyncRoute(async (req, res) => {
    const items = await Course.find({
      tags: { $in: ['react', 'nextjs'] },
    })
      .sort({ publishedAt: -1, _id: -1 })
      .lean();
    res.json(ok(items, { message: 'Lấy danh sách khoá học thành công (ex2)' }));
  })
);

router.get(
  '/ex3',
  asyncRoute(async (req, res) => {
    const items = await Course.find({
      tags: { $all: ['mongodb', 'node'] },
      price: { $gte: 0, $lte: 500000 },
    }).lean();

    res.json(ok(items, { message: 'Lấy danh sách khoá học thành công (ex3)' }));
  })
);

router.get(
  '/',
  asyncRoute(async (req, res) => {
    const items = await Course.find({});
    res.json(items);
  })
);

router.get(
  '/getIndexes',
  asyncRoute(async (req, res) => {
    const items = await Course.listIndexes();
    res.json(items);
  })
);

// Get courses with enrollment information
router.get(
  '/with-enrollment',
  asyncRoute(async (req, res) => {
    const { userId, status } = req.query;

    // Build match stage for enrollments
    const enrollmentMatch = {};
    if (userId) enrollmentMatch.userId = userId;
    if (status) enrollmentMatch.status = status;

    const courses = await Course.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'courseId',
          as: 'enrollments',
          pipeline: [
            { $match: enrollmentMatch }
          ]
        }
      },
      {
        $addFields: {
          enrollmentCount: { $size: '$enrollments' }
        }
      }
    ]);

    res.json(ok(courses, { message: 'Lấy danh sách khoá học cùng thông tin đăng ký thành công' }));
  })
);

// Get a specific course with its enrollment details
router.get(
  '/:id/with-enrollment',
  asyncRoute(async (req, res) => {
    const { id } = req.params;
    const { userId, status } = req.query;

    // Build match stage for enrollments
    const enrollmentMatch = { courseId: id };
    if (userId) enrollmentMatch.userId = userId;
    if (status) enrollmentMatch.status = status;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrollments = await Enrollment.find(enrollmentMatch).sort({ enrolledAt: -1 });

    const result = {
      ...course.toObject(),
      enrollments,
      enrollmentCount: enrollments.length
    };

    res.json(ok(result, { message: 'Lấy thông tin khoá học cùng đăng ký thành công' }));
  })
);

module.exports = router;
