const mongoose = require('mongoose');

let conn;

async function connect() {
  if (!conn) conn = mongoose.connect('mongodb://localhost:27017/lms');

  return conn;
}

module.exports = { connect };
