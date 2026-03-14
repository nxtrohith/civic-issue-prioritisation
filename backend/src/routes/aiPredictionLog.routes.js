const express = require("express");
const AIPredictionLog = require("../../models/AIPredictionLog.model");
const Issue = require("../../models/Issue.model");

const router = express.Router();

// GET all AI prediction logs
router.get("/", async (req, res, next) => {
  try {
    const logs = await AIPredictionLog.find()
      .populate("issue", "title description severityScore");

    res.status(200).json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    next(error);
  }
});

// GET AI prediction log by ID
router.get("/:id", async (req, res, next) => {
  try {
    const log = await AIPredictionLog.findById(req.params.id)
      .populate("issue", "title description severityScore location user");

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "AI prediction log not found"
      });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
});

// GET AI prediction log by Issue ID
router.get("/issue/:issueId", async (req, res, next) => {
  try {
    const log = await AIPredictionLog.findOne({ issue: req.params.issueId })
      .populate("issue", "title description severityScore location user");

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "AI prediction log not found for this issue"
      });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
});

// CREATE new AI prediction log
router.post("/", async (req, res, next) => {
  try {
    const { issue, modelVersion, predictedIssueType, severityScore, confidenceScore } = req.body;

    if (!issue || !modelVersion) {
      return res.status(400).json({
        success: false,
        message: "issue and modelVersion are required"
      });
    }

    // Verify issue exists
    const issueExists = await Issue.findById(issue);
    if (!issueExists) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    // Check if log already exists for this issue
    const existingLog = await AIPredictionLog.findOne({ issue });
    if (existingLog) {
      return res.status(409).json({
        success: false,
        message: "AI prediction log already exists for this issue"
      });
    }

    const newLog = new AIPredictionLog({
      issue,
      modelVersion,
      predictedIssueType,
      severityScore,
      confidenceScore
    });

    const savedLog = await newLog.save();
    const populatedLog = await savedLog.populate("issue", "title description severityScore");

    res.status(201).json({
      success: true,
      data: populatedLog
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE AI prediction log
router.put("/:id", async (req, res, next) => {
  try {
    const allowedFields = ["modelVersion", "predictedIssueType", "severityScore", "confidenceScore"];
    const updateData = {};

    allowedFields.forEach(field => {
      if (field in req.body) {
        updateData[field] = req.body[field];
      }
    });

    const updatedLog = await AIPredictionLog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("issue", "title description severityScore");

    if (!updatedLog) {
      return res.status(404).json({
        success: false,
        message: "AI prediction log not found"
      });
    }

    res.status(200).json({
      success: true,
      data: updatedLog
    });
  } catch (error) {
    next(error);
  }
});

// DELETE AI prediction log
router.delete("/:id", async (req, res, next) => {
  try {
    const deletedLog = await AIPredictionLog.findByIdAndDelete(req.params.id);

    if (!deletedLog) {
      return res.status(404).json({
        success: false,
        message: "AI prediction log not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "AI prediction log deleted successfully",
      data: deletedLog
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
