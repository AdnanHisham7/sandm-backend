const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  images: [String],
  sketchImages: [String],
  specifications: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 6;
      },
      message: 'Exceeds the limit of 6 specifications'
    }
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);