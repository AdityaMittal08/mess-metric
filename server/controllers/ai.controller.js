const axios = require('axios');

// 👇 CRITICAL FIX: Use the Environment Variable, or default to Localhost only for testing
// Replace 'https://mess-metric-python.onrender.com' with your ACTUAL Python Service URL if different
const AI_URL = process.env.AI_ENGINE_URL || 'https://mess-metric-python.onrender.com';

exports.getPrediction = async (req, res) => {
    try {
        const { attendance, day_of_week, is_weekend, is_special_event } = req.body;

        if (!attendance) {
            return res.status(400).json({ 
                success: false, 
                message: "Attendance count is required." 
            });
        }

        // Use the Dynamic URL (AI_URL) instead of hardcoded localhost
        const aiResponse = await axios.post(`${AI_URL}/predict`, {
            attendance,
            day_of_week,
            is_weekend,
            is_special_event
        });

        return res.status(200).json({
            success: true,
            data: aiResponse.data
        });

    } catch (error) {
        console.error("❌ AI Prediction Error:", error.message);
        return res.status(500).json({ success: false, message: "AI Engine is offline." });
    }
};

exports.analyzeFeedback = async (req, res) => {
    try {
        const { feedback } = req.body;

        if (!feedback) {
            return res.status(400).json({ success: false, message: "Feedback text is required." });
        }

        console.log(`📡 Connecting to AI at: ${AI_URL}/analyze-feedback`);

        // Use the Dynamic URL (AI_URL) here too!
        const aiResponse = await axios.post(`${AI_URL}/analyze-feedback`, {
            feedback
        });

        return res.status(200).json({
            success: true,
            data: aiResponse.data
        });

    } catch (error) {
        console.error(`❌ AI Analysis Failed (Target: ${AI_URL}):`, error.message);
        // We return 500 so the frontend knows the AI failed (instead of failing silently)
        return res.status(500).json({ success: false, message: "AI Analysis Failed" });
    }
};