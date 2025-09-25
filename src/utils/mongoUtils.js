const mongoose = require('mongoose');

const toObjectId = value => {
  if (!value) return null;
  return mongoose.isValidObjectId(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
};

module.exports = { toObjectId };
