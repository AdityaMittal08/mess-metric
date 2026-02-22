const express = require('express');
const router = express.Router();
const { claimReward } = require('../controllers/reward.controller');

router.post('/claim', claimReward);

module.exports = router;