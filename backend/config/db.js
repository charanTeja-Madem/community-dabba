const mongoose = require('mongoose');

const normalizeConnectionString = (value) => {
  if (!value) return '';

  const trimmed = String(value).trim();

  const uriMatch = trimmed.match(/mongodb(?:\+srv)?:\/\/\S+/i);
  if (uriMatch) {
    return uriMatch[0].replace(/[),;\]]+$/g, '').trim();
  }

  const keyValueMatch = trimmed.match(/^[A-Za-z_][A-Za-z0-9_]*=(.*)$/);
  if (keyValueMatch) {
    const extracted = keyValueMatch[1].trim();
    const nestedMatch = extracted.match(/mongodb(?:\+srv)?:\/\/\S+/i);
    if (nestedMatch) {
      return nestedMatch[0].replace(/[),;\]]+$/g, '').trim();
    }

    if (extracted) {
      return extracted.replace(/^['"]|['"]$/g, '').trim();
    }
  }

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

const connectDB = async () => {
  try {
    const connectionString = normalizeConnectionString(
      process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB_URL || process.env.DATABASE_URL
    );

    if (!connectionString) {
      throw new Error('Database connection string is missing. Set MONGODB_URI, MONGO_URI, DB_URL, or DATABASE_URL in Render or .env');
    }

    if (!/^mongodb(\+srv)?:\/\//i.test(connectionString)) {
      throw new Error('Invalid MongoDB connection string. It must start with mongodb:// or mongodb+srv://');
    }

    const conn = await mongoose.connect(connectionString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;