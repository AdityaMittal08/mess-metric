const SkipRequest = require("../models/SkipRequest");
const User = require("../models/User");

// POST /api/meals/skip
// body: { mealType }
// Auth middleware must populate req.user with { id }
exports.requestSkip = async (req, res) => {
  try {
    const { mealType } = req.body;
    const studentId = req.user && req.user.id;
    console.log("REQ.USER:", req.user);
    console.log("STUDENT ID:", studentId);

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validMeals = ["Breakfast", "Lunch", "Snacks", "Dinner"];
    if (!mealType || !validMeals.includes(mealType)) {
      return res.status(400).json({ message: "Invalid mealType provided" });
    }

    // compute today's range in server timezone
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existing = await SkipRequest.findOne({
      studentId,
      mealType,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existing) {
      return res.status(429).json({
        message: "You have already requested to skip this meal today.",
      });
    }

    const skipReq = new SkipRequest({ studentId, mealType });
    await skipReq.save();

    return res.status(200).json({
      success: true,
      message: "Skip request submitted and is pending approval.",
      requestId: skipReq._id,
      
    });
  } catch (err) {
    console.error("[skip.controller] error", err);
    return res.status(500).json({
      message: "Server error while processing skip request",
    });
  }
};

// GET /api/meals - ADMIN ONLY
// Fetch all pending skip requests for admin dashboard
exports.getPendingSkipRequests = async (req, res) => {
  try {
    // Check if user is admin by checking JWT role
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
    }

    // Fetch all pending skip requests with student details populated
    const skipRequests = await SkipRequest.find({ status: "Pending" })
      .populate("studentId", "name registrationNo email walletAddress")
      .sort({ createdAt: -1 });

    // Format data to match expected admin dashboard structure
    const formattedRequests = skipRequests.map(req => ({
      id: req._id,
      _id: req._id,
      studentId: req.studentId?._id || req.studentId,
      student: req.studentId?.name || "Unknown",
      regNo: req.studentId?.registrationNo || "Unknown",
      walletAddress: req.studentId?.walletAddress || "",
      mealType: req.mealType,
      date: req.date,
      status: req.status,
      createdAt: req.createdAt,
      timestamp: new Date(req.createdAt).toLocaleDateString(),
    }));

    return res.json({ success: true, data: formattedRequests });
  } catch (err) {
    console.error("[skip.controller] error fetching pending requests:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching skip requests",
    });
  }
};

// GET /api/meals/my-requests - STUDENT
// Fetch student's own skip requests and coin balance
exports.getStudentSkipRequests = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch all skip requests for this student
    const skipRequests = await SkipRequest.find({ studentId })
      .sort({ createdAt: -1 });

    // Fetch student's coin balance
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const formattedRequests = skipRequests.map(req => ({
      id: req._id,
      mealType: req.mealType,
      date: req.date,
      status: req.status,
      createdAt: req.createdAt,
    }));

    return res.json({
      success: true,
      data: {
        skipRequests: formattedRequests,
        student: {
          name: student.name,
          mealCoins: student.mealCoins,
          email: student.email
        }
      }
    });
  } catch (err) {
    console.error("[skip.controller] error fetching student requests:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching skip requests",
    });
  }
};

// PUT /api/meals/:id/approve - ADMIN ONLY
// Approve a skip request and award coins to student
exports.approveSkipRequest = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
    }

    const { id } = req.params;
    const SKIP_REWARD_COINS = 50; // Coins awarded for approved skip request

    // Find and update the skip request
    const skipRequest = await SkipRequest.findByIdAndUpdate(
      id,
      { status: "Approved" },
      { new: true }
    ).populate("studentId", "name registrationNo email walletAddress mealCoins");

    if (!skipRequest) {
      return res.status(404).json({ success: false, message: "Skip request not found" });
    }

    // Update student's mealCoins
    const student = await User.findByIdAndUpdate(
      skipRequest.studentId._id,
      { mealCoins: (skipRequest.studentId.mealCoins || 0) + SKIP_REWARD_COINS },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    console.log(`✅ Skip request approved | Student: ${student.name} | Coins awarded: +${SKIP_REWARD_COINS} (Total: ${student.mealCoins})`);

    return res.json({
      success: true,
      message: `Skip request approved! ${SKIP_REWARD_COINS} coins awarded to ${student.name}`,
      data: {
        skipRequest,
        student: {
          id: student._id,
          name: student.name,
          mealCoins: student.mealCoins
        }
      },
    });
  } catch (err) {
    console.error("[skip.controller] error approving request:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while approving skip request",
    });
  }
};

