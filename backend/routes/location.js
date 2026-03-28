const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Location = require('../models/Location');

// Update location
router.post('/update', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    const location = new Location({
      userId: req.user.id,
      latitude,
      longitude
    });
    
    await location.save();
    res.json({ msg: 'Location updated', location });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all locations
router.get('/all', async (req, res) => {
  try {
    const locations = await Location.find().sort({ timestamp: -1 });
    res.json(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user location history
router.get('/history/:userId', async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
