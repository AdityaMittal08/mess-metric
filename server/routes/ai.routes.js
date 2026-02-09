const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Route: POST /api/ai/predict (For Waste Graph)
router.post('/predict', aiController.getPrediction);

// Route: POST /api/ai/analyze (For Feedback Box) 👈 NEW
router.post('/analyze', aiController.analyzeFeedback);

module.exports = router;