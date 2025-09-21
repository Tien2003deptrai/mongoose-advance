const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/?directConnection=true';

const client = new MongoClient(uri);

async function db() {
  if (!client.topology || !client.topology.isConnected())
    await client.connect();

  return client.db('lms');
}

module.exports = { db };
