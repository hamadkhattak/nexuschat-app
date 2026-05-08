const jwt = require('jsonwebtoken');
const Business = require('../models/Business');

const generateToken = (businessId) =>
  jwt.sign({ id: businessId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async ({ name, email, password }) => {
  const existing = await Business.findOne({ email });
  if (existing) throw new Error('Email already registered');

  const business = await Business.create({ name, email, password });
  const token = generateToken(business._id);

  return { business: { id: business._id, name: business.name, email: business.email }, token };
};

const login = async ({ email, password }) => {
  const business = await Business.findOne({ email }).select('+password');
  if (!business || !(await business.comparePassword(password))) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(business._id);
  return { business: { id: business._id, name: business.name, email: business.email }, token };
};

module.exports = { register, login };
