const express = require('express');
const multer = require('multer');
const path = require('path');
const Item = require('../models/Item');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all items
router.get('/', auth, async (req, res) => {
  try {
    const { category, search } = req.query;
    const user = await User.findById(req.userId);
    
    let query = {};
    const orConditions = [];

    if (user.activeCommunity) {
      orConditions.push({ community: user.activeCommunity, isGeneral: false });
    }

    if (user.location && user.location.coordinates && user.location.coordinates.length === 2) {
      orConditions.push({
        isGeneral: true,
        location: {
          $geoWithin: {
            $centerSphere: [user.location.coordinates, 2 / 6378.1] // 2km radius in radians
          }
        }
      });
    }

    if (orConditions.length === 0) {
      return res.json([]); 
    }

    query.$or = orConditions;

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      const searchTerms = { $regex: search, $options: 'i' };
      query = {
        $and: [
          query,
          {
            $or: [
              { title: searchTerms },
              { description: searchTerms }
            ]
          }
        ]
      };
    }

    const items = await Item.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's items
router.get('/my-items', auth, async (req, res) => {
  try {
    const items = await Item.find({ owner: req.userId })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name email');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create item
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, pricePerDay, rateType, isGeneral } = req.body;
    const user = await User.findById(req.userId);

    const isGeneralBool = isGeneral === 'true' || isGeneral === true;
    let communityId = null;
    let itemLocation = undefined;

    if (isGeneralBool) {
      if (!user.location || !user.location.coordinates || user.location.coordinates.length < 2) {
        return res.status(400).json({ message: 'Please set your location first to post a general item.' });
      }
      itemLocation = user.location;
    } else {
      if (!user.activeCommunity) {
        return res.status(400).json({ message: 'Please select a community before adding items' });
      }
      communityId = user.activeCommunity;
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const item = new Item({
      title,
      description,
      category,
      pricePerDay: pricePerDay || 0,
      rateType: rateType || 'day',
      image: imagePath,
      owner: req.userId,
      community: communityId,
      isGeneral: isGeneralBool,
      location: itemLocation
    });

    await item.save();
    await item.populate('owner', 'name email');

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('owner', 'name email');

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;