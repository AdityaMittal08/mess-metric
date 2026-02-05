const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Route: POST /api/ai/predict
router.post('/predict', aiController.getPrediction);

module.exports = router;