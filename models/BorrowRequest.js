const mongoose = require('mongoose');

const BorrowRequestSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Requested', 'Approved', 'Rejected', 'Returned'],
    default: 'Requested'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  borrowDays: {
    type: Number,
    required: true,
    min: 1
  },
  message: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('BorrowRequest', BorrowRequestSchema);