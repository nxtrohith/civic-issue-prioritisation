const express = require("express");
const Issue = require("../../models/Issue.model");
const User = require("../../models/User.model");

const router = express.Router();

// GET all issues
router.get("/", async (req, res, next) => {
  try {
    const { status, sortBy } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    let issues = Issue.find(query).populate("user", "fullName email imageUrl").populate("upvotes", "fullName");

    if (sortBy === "priority") {
      issues = issues.sort({ severityScore: -1 });
    } else if (sortBy === "recent") {
      issues = issues.sort({ createdAt: -1 });
    } else if (sortBy === "upvotes") {
      // Sort by upvote count (handled after population)
      const results = await issues.exec();
      results.sort((a, b) => b.upvoteCount - a.upvoteCount);
      return res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    }

    const result = await issues.exec();

    res.status(200).json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error) {
    next(error);
  }
});

// GET issue by ID
router.get("/:id", async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("user", "fullName email imageUrl")
      .populate("upvotes", "fullName email");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
});

// CREATE new issue
router.post("/", async (req, res, next) => {
  try {
    const { user, title, description, location, imageUrl, severityScore, suggestedDepartment } = req.body;

    if (!user || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "user, title, and description are required"
      });
    }

    // Verify user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const newIssue = new Issue({
      user,
      title,
      description,
      location,
      imageUrl,
      severityScore,
      suggestedDepartment
    });

    const savedIssue = await newIssue.save();
    const populatedIssue = await savedIssue.populate("user", "fullName email imageUrl");

    res.status(201).json({
      success: true,
      data: populatedIssue
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE issue
router.put("/:id", async (req, res, next) => {
  try {
    const allowedFields = ["title", "description", "location", "imageUrl", "severityScore", "suggestedDepartment", "status"];
    const updateData = {};

    allowedFields.forEach(field => {
      if (field in req.body) {
        updateData[field] = req.body[field];
      }
    });

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "fullName email imageUrl").populate("upvotes", "fullName");

    if (!updatedIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    res.status(200).json({
      success: true,
      data: updatedIssue
    });
  } catch (error) {
    next(error);
  }
});

// UPVOTE an issue
router.post("/:id/upvote", async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    // Check if user already upvoted
    if (issue.upvotes.includes(userId)) {
      // Remove upvote
      issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
    } else {
      // Add upvote
      issue.upvotes.push(userId);
    }

    const updatedIssue = await issue.save();
    const populated = await updatedIssue.populate("user", "fullName email imageUrl").populate("upvotes", "fullName");

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE issue
router.delete("/:id", async (req, res, next) => {
  try {
    const deletedIssue = await Issue.findByIdAndDelete(req.params.id);

    if (!deletedIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
      data: deletedIssue
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
