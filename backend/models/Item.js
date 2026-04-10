const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Tools', 'Books', 'Sports', 'Kitchen', 'Garden', 'Other']
  },
  pricePerDay: {
    type: Number,
    default: 0,
    min: 0
  },
  rateType: {
    type: String,
    enum: ['hour', 'day'],
    default: 'day'
  },
  available: {
    type: Boolean,
    default: true
  },
  image: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  isGeneral: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'], 
    },
    coordinates: {
      type: [Number],
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a 2dsphere index on the location field to enable geospatial queries
ItemSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Item', ItemSchema);