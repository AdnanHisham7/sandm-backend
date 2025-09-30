const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    enum: ['livora', 'enencia', 'sifon'],
  },
  visitorId: {
    type: String,
    required: true,
    unique: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Visitor', visitorSchema);
