const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB_URL;

    if (!connectionString) {
      throw new Error('Database connection string is missing. Set MONGODB_URI, MONGO_URI, or DB_URL in .env');
    }

    const conn = await mongoose.connect(connectionString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;