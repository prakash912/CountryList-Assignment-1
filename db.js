const mongoose = require('mongoose');

async function connect(URL) {
  try {
    await mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
}

module.exports = connect;
