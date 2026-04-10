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
    enum: ['Requested', 'Approved', 'Rejected', 'Paid', 'Returned'],
    default: 'Requested'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  borrowDays: {
    type: Number,
    min: 1
  },
  borrowDuration: {
    type: Number,
    min: 1
  },
  durationType: {
    type: String,
    enum: ['hours', 'days'],
    default: 'days'
  },
  message: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date
  },
  totalCost: {
    type: Number,
    min: 0
  }
});

module.exports = mongoose.model('BorrowRequest', BorrowRequestSchema);