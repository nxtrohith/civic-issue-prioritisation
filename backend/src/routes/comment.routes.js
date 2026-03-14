const express = require("express");
const Comment = require("../../models/Comment.model");
const Issue = require("../../models/Issue.model");
const User = require("../../models/User.model");

const router = express.Router();

// GET all comments
router.get("/", async (req, res, next) => {
  try {
    const { issueId } = req.query;
    let query = {};

    if (issueId) {
      query.issue = issueId;
    }

    const comments = await Comment.find(query)
      .populate("user", "fullName email imageUrl")
      .populate("issue", "title");

    res.status(200).json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error) {
    next(error);
  }
});

// GET comment by ID
router.get("/:id", async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate("user", "fullName email imageUrl")
      .populate("issue", "title description");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
});

// CREATE new comment
router.post("/", async (req, res, next) => {
  try {
    const { issue, user, commentText } = req.body;

    if (!issue || !user || !commentText) {
      return res.status(400).json({
        success: false,
        message: "issue, user, and commentText are required"
      });
    }

    // Verify issue and user exist
    const issueExists = await Issue.findById(issue);
    const userExists = await User.findById(user);

    if (!issueExists || !userExists) {
      return res.status(404).json({
        success: false,
        message: "Issue or User not found"
      });
    }

    const newComment = new Comment({
      issue,
      user,
      commentText
    });

    const savedComment = await newComment.save();
    const populatedComment = await savedComment
      .populate("user", "fullName email imageUrl")
      .populate("issue", "title");

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE comment
router.put("/:id", async (req, res, next) => {
  try {
    const { commentText } = req.body;

    if (!commentText) {
      return res.status(400).json({
        success: false,
        message: "commentText is required"
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { commentText },
      { new: true, runValidators: true }
    )
      .populate("user", "fullName email imageUrl")
      .populate("issue", "title");

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: updatedComment
    });
  } catch (error) {
    next(error);
  }
});

// DELETE comment
router.delete("/:id", async (req, res, next) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);

    if (!deletedComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: deletedComment
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
