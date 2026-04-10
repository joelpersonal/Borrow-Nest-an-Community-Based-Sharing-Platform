const express = require('express');
const Community = require('../models/Community');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate a random 6-digit community number
const generateCommunityNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create a community
router.post('/create', auth, async (req, res) => {
  try {
    const { name } = req.body;
    let communityNumber = generateCommunityNumber();
    
    // Ensure unique community number
    while (await Community.findOne({ communityNumber })) {
      communityNumber = generateCommunityNumber();
    }

    const community = new Community({
      name,
      communityNumber,
      creator: req.userId,
      members: [req.userId]
    });

    await community.save();

    // Add community to user's list and set as active
    await User.findByIdAndUpdate(req.userId, {
      $push: { communities: community._id },
      activeCommunity: community._id
    });

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request to join a community via communityNumber
router.post('/join', auth, async (req, res) => {
  try {
    const { communityNumber } = req.body;
    const community = await Community.findOne({ communityNumber });

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.members.includes(req.userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    const isPending = community.pendingRequests.some(r => r.user.toString() === req.userId);
    if (isPending) {
      return res.status(400).json({ message: 'Join request already pending' });
    }

    community.pendingRequests.push({ user: req.userId });
    await community.save();

    res.json({ message: 'Join request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's communities
router.get('/my-communities', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('communities');
    res.json(user.communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending requests for creator (specific community)
router.get('/requests/:communityId', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId)
      .populate('pendingRequests.user', 'name email');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(community.pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pending requests for all communities created by the user
router.get('/total-requests', auth, async (req, res) => {
  try {
    const communities = await Community.find({ creator: req.userId })
      .populate('pendingRequests.user', 'name email');
    
    // Flatten requests and include community info
    const allRequests = communities.reduce((acc, comm) => {
      const commRequests = comm.pendingRequests.map(req => ({
        ...req.toObject(),
        communityId: comm._id,
        communityName: comm.name
      }));
      return [...acc, ...commRequests];
    }, []);

    res.json(allRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Respond to join request
router.post('/requests/respond', auth, async (req, res) => {
  try {
    const { communityId, userId, action } = req.body; // action: 'accept' or 'decline'
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (action === 'accept') {
      community.members.push(userId);
      await User.findByIdAndUpdate(userId, {
        $push: { communities: communityId },
        activeCommunity: communityId
      });
    }

    community.pendingRequests = community.pendingRequests.filter(req => req.user.toString() !== userId);
    await community.save();

    res.json({ message: `Request ${action}ed` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete community (Creator only)
router.delete('/:communityId', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the creator can delete the community' });
    }

    const Item = require('../models/Item');
    
    // 1. Delete all items in this community
    await Item.deleteMany({ community: community._id });

    // 2. Remove community from all members' communities array
    await User.updateMany(
      { communities: community._id },
      { $pull: { communities: community._id } }
    );

    // 3. Reset activeCommunity for users who had this community as active
    await User.updateMany(
      { activeCommunity: community._id },
      { $set: { activeCommunity: null } }
    );

    // 4. Delete the community itself
    await Community.findByIdAndDelete(req.params.communityId);

    res.json({ message: 'Community and associated items permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Switch active community
router.post('/switch-active', auth, async (req, res) => {
  try {
    const { communityId } = req.body;
    const user = await User.findById(req.userId);

    if (!user.communities.includes(communityId)) {
      return res.status(403).json({ message: 'Not a member of this community' });
    }

    user.activeCommunity = communityId;
    await user.save();

    res.json({ message: 'Active community switched', activeCommunity: communityId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave community (Member only)
router.post('/leave/:communityId', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.creator.toString() === req.userId) {
      return res.status(400).json({ message: 'Creators cannot leave their own community. Use Delete instead.' });
    }

    // Remove user from community members
    community.members = community.members.filter(m => m.toString() !== req.userId);
    await community.save();

    // Remove community from user communities and reset activeCommunity if needed
    const user = await User.findById(req.userId);
    user.communities = user.communities.filter(c => c.toString() !== req.params.communityId);
    
    if (user.activeCommunity?.toString() === req.params.communityId) {
      user.activeCommunity = null;
    }
    
    await user.save();

    res.json({ message: 'You have left the community' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
