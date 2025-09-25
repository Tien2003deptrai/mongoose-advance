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

module.exports = router;
