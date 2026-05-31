const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  repo: { type: String, required: true },
  pr_number: { type: Number, required: true },
  pr_title: { type: String, required: true },
  pr_url: { type: String },
  files_reviewed: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  summary: { type: String },
  full_review: { type: String },
  status: { type: String, default: 'completed' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);