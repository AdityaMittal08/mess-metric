const axios = require('axios');

// Controller to handle AI prediction requests
exports.getPrediction = async (req, res) => {
    try {
        // 1. Extract data from the incoming request (from Frontend)
        const { attendance, day_of_week, is_weekend, is_special_event } = req.body;

        // Validation: Ensure attendance is provided
        if (!attendance) {
            return res.status(400).json({ 
                success: false, 
                message: "Attendance count is required." 
            });
        }

        // 2. Call your local Python AI Engine (Port 5001)
        // Note: We use 127.0.0.1 to avoid 'localhost' issues
        const aiResponse = await axios.post('http://127.0.0.1:5001/predict', {
            attendance,
            day_of_week,
            is_weekend,
            is_special_event
        });

        // 3. Send the AI's response back to the client
        return res.status(200).json({
            success: true,
            data: aiResponse.data
        });

    } catch (error) {
        console.error("❌ AI Engine Error:", error.message);
        
        // Handle case where Python server is off
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                success: false, 
                message: "AI Engine is currently offline. Please start the Python server." 
            });
        }

        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error during prediction." 
        });
    }
};