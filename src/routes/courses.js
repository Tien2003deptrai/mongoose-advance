const router = require('express').Router();

const { asyncRoute } = require('@uniresp/server-express');
const { Course } = require('../models/course');
const { ok } = require('@uniresp/core');
const { Enrollment } = require('../models/enrollment');

// Aggregation
router.get(
  '/aggregation/topFiveCourse',
  asyncRoute(async (req, res) => {
    const items = await Enrollment.aggregate([
      {
        $match: {
          updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
        },
      },
      {
        $group: {
          _id: '$courseId',
          events: { $sum: 1 },
          learners: { $addToSet: '$userId' },
        },
      },
      { $project: { events: 1, learnerCount: { $size: '$learners' } } },
      { $sort: { events: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $project: {
          title: { $first: '$course.title' },
          events: 1,
          learnerCount: 1,
        },
      },
    ]);

    res.json(
      ok(items, { message: 'Lấy danh sách khoá học thành công (aggregation)' })
    );
  })
);

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

module.exports = router;
