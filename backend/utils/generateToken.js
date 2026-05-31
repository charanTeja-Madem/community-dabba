const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

  if (!secret) {
    throw new Error('JWT secret is missing. Set JWT_SECRET or JWT_SECRET_KEY in .env');
  }

  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;