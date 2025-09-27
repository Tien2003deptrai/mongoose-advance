const { asyncRoute } = require('@uniresp/server-express');
const { ok } = require('@uniresp/core');
const { NotFoundError, ValidationError } = require('@uniresp/errors');

const { Enrollment } = require('../models/enrollment');
const { Progress } = require('../models/progress');
const { Course } = require('../models/course');
const { toObjectId } = require('../utils/mongoUtils');

const router = require('express').Router();

router.post(
  '/count-courses-by-level',
  asyncRoute(async (req, res) => {
    const result = await Course.aggregate([
      { $group: { _id: '$level', totalCourses: { $sum: 1 } } },
      { $project: { _id: 0, level: '$_id', totalCourses: 1 } },
      { $sort: { totalCourses: -1 } },
    ]);
    res.json(ok(result, { message: 'ĐẾM SỐ LƯỢNG KHÓA HỌC THEO LEVEL' }));
  })
);

// ĐẾM SỐ LƯỢNG HỌC VIÊN THEO KHÓA HỌC (id)
router.post(
  '/count-students-by-course',
  asyncRoute(async (req, res) => {
    const courseId = req.body.courseId;
    const courseObjectId = toObjectId(courseId);

    if (!courseObjectId) {
      throw new ValidationError({ courseId: 'courseId is invalid' });
    }
    if (!(await Course.findById(courseObjectId))) {
      throw new NotFoundError('Course not found');
    }

    const result = await Enrollment.aggregate([
      { $match: { status: 'active', courseId: courseObjectId } },
      { $group: { _id: '$courseId', totalStudents: { $sum: 1 } } },
    ]);

    res.json(ok(result, { message: 'ĐẾM SỐ LƯỢNG HỌC VIÊN THEO KHÓA HỌC' }));
  })
);

router.post(
  '/total-duration-by-course',
  asyncRoute(async (req, res) => {
    const { courseId } = req.body;
    const courseObjectId = toObjectId(courseId);

    if (!courseObjectId) {
      throw new ValidationError({ courseId: 'courseId is invalid' });
    }
    if (!(await Course.findById(courseObjectId))) {
      throw new NotFoundError('Course not found');
    }

    const result = await Progress.aggregate([
      { $match: { status: 'done', courseId: courseObjectId } },
      { $group: { _id: '$courseId', totalDuration: { $sum: '$durationSec' } } },
    ]);

    res.json(ok(result, { message: 'TỔNG THỜI GIAN HỌC THEO KHÓA HỌC' }));
  })
);

// write a aggregation basic - 27/09/2025
// a) count total courses by tag
router.post(
  '/count-courses-by-tags',
  asyncRoute(async (req, res) => {
    const result = await Course.aggregate([
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(ok(result, { message: 'ĐẾM SỐ LƯỢNG KHÓA HỌC THEO TAG' }));
  })
);

// b) top tags phổ biến (cần unwind)
router.post(
  '/top-tags',
  asyncRoute(async (req, res) => {
    const result = await Course.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(ok(result, { message: 'TOP TAGS PHỔ BIẾN' }));
  })
);

// c) top courses by level (cần unwind)
router.post(
  '/top-courses-by-level',
  asyncRoute(async (req, res) => {
    const result = await Course.aggregate([
      { $unwind: '$level' },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(ok(result, { message: 'TOP KHÓA HỌC THEO LEVEL' }));
  })
);

// d) Danh sách coures filter + phân phối facet (UI filter)
router.post(
  '/courses-filter',
  asyncRoute(async (req, res) => {
    const result = await Course.aggregate([
      { $match: { price: { $gte: 100000, $lte: 200000 } } },
      { $sort: { publishedAt: -1, _id: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          title: 1,
          price: 1,
          level: 1,
          tags: 1,
          publishedAt: 1,
          stats: 1,
        },
      },
    ]);
    res.json(ok(result, { message: 'DANH SÁCH KHÓA HỌC FILTER' }));
  })
);

router.post(
  '/courses-filter-and-facet',
  asyncRoute(async (req, res) => {
    const { min = 100000, max = 200000, limit = 10 } = req.body ?? {};
    const baseMatch = { price: { $gte: +min, $lte: +max } };

    const pipeline = [
      { $match: baseMatch }, // tận dụng index ở đây
      { $sort: { publishedAt: -1, _id: -1 } }, // sort sớm cho nhánh items
      {
        $facet: {
          items: [
            { $limit: +limit },
            {
              $project: {
                _id: 1,
                title: 1,
                price: 1,
                level: 1,
                tags: 1,
                publishedAt: 1,
                stats: 1,
              },
            },
          ],
          byLevel: [
            { $group: { _id: '$level', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          topTags: [
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ],
          priceBuckets: [
            {
              $bucket: {
                groupBy: '$price',
                boundaries: [0, 100000, 200000, 500000, 1000000, 999999999],
                default: '>=1m',
                output: { count: { $sum: 1 } },
              },
            },
          ],
          totalCount: [{ $count: 'value' }],
        },
      },
    ];

    const [data] = await Course.aggregate(pipeline).allowDiskUse(true);
    res.json(ok(data, { message: 'DANH SÁCH KHÓA HỌC + FACETS' }));
  })
);

// assignment
// a) filter + panigate (No facet)
router.post(
  '/courses-filter-and-panigate',
  asyncRoute(async (req, res) => {
    const { min = 100000, max = 200000, limit = 10 } = req.body ?? {};
    const baseMatch = { price: { $gte: +min, $lte: +max } };

    const pipeline = [
      { $match: baseMatch },
      { $sort: { publishedAt: -1, _id: -1 } },
      { $limit: +limit },
      {
        $project: {
          _id: 1,
          title: 1,
          price: 1,
          level: 1,
          tags: 1,
          publishedAt: 1,
          stats: 1,
        },
      },
    ];

    const countPipeline = [{ $match: baseMatch }, { $count: 'totalCount' }];

    const [data, countResult] = await Promise.all([
      Course.aggregate(pipeline).allowDiskUse(true),
      Course.aggregate(countPipeline).allowDiskUse(true),
    ]);

    const total = countResult[0]?.totalCount ?? 0;

    res.json(
      ok(data, {
        message: 'DANH SÁCH KHÓA HỌC FILTER + PANIGATE',
        meta: { total },
      })
    );
  })
);

// B) List + Facets(CÓ facet, 1 request nhiều khối)
router.post(
  '/courses-filter-and-facets',
  asyncRoute(async (req, res) => {
    const { min = 100000, max = 200000, limit = 10 } = req.body ?? {};
    const baseMatch = { price: { $gte: +min, $lte: +max } };

    const pipeline = [
      { $match: baseMatch },
      { $sort: { publishedAt: -1, _id: -1 } },
      { $limit: +limit },
      {
        $project: {
          _id: 1,
          title: 1,
          price: 1,
          level: 1,
          tags: 1,
          publishedAt: 1,
          stats: 1,
        },
      },
      {
        $facet: {
          items: [
            { $limit: +limit },
            {
              $project: {
                _id: 1,
                title: 1,
                price: 1,
                level: 1,
                tags: 1,
                publishedAt: 1,
                stats: 1,
              },
            },
          ],
          byLevel: [
            { $group: { _id: '$level', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          topTags: [
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ],
          totalCount: [{ $count: 'value' }],
        },
      },
    ];
    const countPipeline = [{ $match: baseMatch }, { $count: 'totalCount' }];
    const [data, countResult] = await Promise.all([
      Course.aggregate(pipeline).allowDiskUse(true),
      Course.aggregate(countPipeline).allowDiskUse(true),
    ]);

    const total = countResult[0]?.totalCount ?? 0;

    res.json(
      ok(data, {
        message: 'DANH SÁCH KHÓA HỌC FILTER + FACETS',
        meta: { total },
      })
    );
  })
);

module.exports = router;
