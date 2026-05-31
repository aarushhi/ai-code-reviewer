const express = require('express');
const router = express.Router();
const Review = require('../models/review');

router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ created_at: -1 }).limit(20);
    const total = await Review.countDocuments();
    const avgScore = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);

    res.json({
      reviews,
      total,
      avgScore: avgScore[0]?.avg?.toFixed(1) || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;