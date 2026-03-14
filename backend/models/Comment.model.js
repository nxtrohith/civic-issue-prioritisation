const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    commentText: { type: String, required: true, trim: true }
  },
  {
    timestamps: true
  }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;