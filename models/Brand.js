// models/Brand.js
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  logo: String,
  url: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Brand', brandSchema);