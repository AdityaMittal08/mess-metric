const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { requestSkip, getStudentSkipRequests, getPendingSkipRequests, approveSkipRequest } = require("../controllers/skip.controller");

// Student endpoint: POST /api/meals/skip - Submit skip request
router.post("/skip", auth, requestSkip);

// Student endpoint: GET /api/meals/my-requests - Get own skip requests
router.get("/my-requests", auth, getStudentSkipRequests);

// Admin endpoint: GET / - Fetch pending skip requests for admin dashboard
router.get("/", auth, getPendingSkipRequests);

// Admin endpoint: PUT /:id/approve - Approve a skip request
router.put("/:id/approve", auth, approveSkipRequest);

module.exports = router;
