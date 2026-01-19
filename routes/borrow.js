const express = require('express');
const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

// Create borrow request
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, borrowDays, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.available) {
      return res.status(400).json({ message: 'Item is not available' });
    }

    if (item.owner.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot borrow your own item' });
    }

    // Check if user already has pending request for this item
    const existingRequest = await BorrowRequest.findOne({
      item: itemId,
      borrower: req.userId,
      status: { $in: ['Requested', 'Approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this item' });
    }

    const borrowRequest = new BorrowRequest({
      item: itemId,
      borrower: req.userId,
      owner: item.owner,
      borrowDays,
      message
    });

    await borrowRequest.save();
    await borrowRequest.populate(['item', 'borrower', 'owner'], 'title name email');

    res.status(201).json(borrowRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's borrow requests (as borrower)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ borrower: req.userId })
      .populate('item', 'title category')
      .populate('owner', 'name email')
      .sort({ requestDate: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get requests for user's items (as owner)
router.get('/received-requests', auth, async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ owner: req.userId })
      .populate('item', 'title category')
      .populate('borrower', 'name email')
      .sort({ requestDate: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status (approve/reject/return)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only owner can approve/reject, both owner and borrower can mark as returned
    if (status === 'Approved' || status === 'Rejected') {
      if (request.owner.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (status === 'Returned') {
      if (request.owner.toString() !== req.userId && request.borrower.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    request.status = status;
    await request.save();

    // Update item availability
    if (status === 'Approved') {
      await Item.findByIdAndUpdate(request.item, { available: false });
    } else if (status === 'Returned' || status === 'Rejected') {
      await Item.findByIdAndUpdate(request.item, { available: true });
    }

    await request.populate(['item', 'borrower', 'owner'], 'title name email');
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;