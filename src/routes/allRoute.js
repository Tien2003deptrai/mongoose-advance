const { asyncRoute } = require('@uniresp/server-express');
const { Enrollment } = require('../models/enrollment');
const { ok } = require('@uniresp/core');
const { Progress } = require('../models/progress');
const { Order } = require('../models/order');

const router = require('express').Router();

router.get(
  '/enrollments',
  asyncRoute(async (req, res) => {
    const items = await Enrollment.find({});
    res.json(ok(items, { message: 'Get list enrollments' }));
  })
);

router.get(
  '/progress',
  asyncRoute(async (req, res) => {
    const items = await Progress.find({});
    res.json(ok(items, { message: 'Get list progress' }));
  })
);

router.get(
  '/orders',
  asyncRoute(async (req, res) => {
    const items = await Order.find({});
    res.json(ok(items, { message: 'Get list orders' }));
  })
);

module.exports = router;
