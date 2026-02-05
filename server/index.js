const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const aiRoutes = require("./routes/ai.routes");
// database
const connectDB = require("./config/db");
connectDB();


const app = express();

// middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/ai", aiRoutes);
// test route
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

// attendance routes
const attendanceRoutes = require("./routes/attendance.routes");
app.use("/api/attendance", attendanceRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
