const express = require("express");
const userRoutes = require("./user.routes");
const issueRoutes = require("./issue.routes");
const commentRoutes = require("./comment.routes");
const aiPredictionLogRoutes = require("./aiPredictionLog.routes");

const router = express.Router();

// Health check
router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "civic-issue-prioritisation-backend",
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use("/user", userRoutes);
router.use("/users", userRoutes); // Alias for plural
router.use("/issue", issueRoutes);
router.use("/issues", issueRoutes); // Alias for plural
router.use("/comment", commentRoutes);
router.use("/comments", commentRoutes); // Alias for plural
router.use("/ai-prediction-log", aiPredictionLogRoutes);
router.use("/ai-prediction-logs", aiPredictionLogRoutes); // Alias for plural

module.exports = router;
