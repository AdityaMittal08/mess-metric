const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import Routes
const authRoutes = require("./routes/auth.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const aiRoutes = require("./routes/ai.routes");
const connectDB = require("./config/db");

const app = express();

// ==========================================
// 1. CORS CONFIGURATION (Crucial for Vercel)
// ==========================================
// I have replaced the complex logic with this wildcard to force it to work.
app.use(cors({
  origin: "*",  // 👈 This allows Vercel to connect without being blocked
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ==========================================
// 2. MIDDLEWARE
// ==========================================
app.use(express.json()); // Parse JSON bodies

// Request Logger (Helps debugging)
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 3. DATABASE CONNECTION
// ==========================================
connectDB().catch(err => {
  console.error("❌ Database connection failed:", err);
  process.exit(1);
});

// ==========================================
// 4. ROUTES
// ==========================================
app.get("/", (req, res) => {
  res.json({ message: "Backend running successfully 🚀", timestamp: new Date().toISOString() });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/ai", aiRoutes);

// Inline requires (cleaner way to load these)
app.use("/api/admin/auth", require("./routes/admin.auth.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/menu", require("./routes/menu.routes"));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ==========================================
// 5. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Backend URL: http://localhost:${PORT}`);
});