const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    predictedIssueType: { type: String, trim: true },
    severityScore: { type: Number, min: 0, max: 10 },
    impactScope: {type: String, enum: ["Individual", "Locality", "Ward", "City-wide"]},
    suggestedDepartment: {
      type: String,
      enum: ["Electrical", "Plumbing", "Civil", "Housekeeping", "Lift", "Security", "Other"]
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["reported", "approved", "in_progress", "resolved"],
      default: "reported"
    },
    estimatedResolution: {
      type: String,
      enum: ["Same Day", "1-3 Days", "1 Week", "2-4 Weeks", "Long-term Project"]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

issueSchema.virtual("upvoteCount").get(function upvoteCountGetter() {
  return this.upvotes.length;
});

issueSchema.virtual("priorityScore").get(function priorityScoreGetter() {
  return (this.severityScore || 0) + this.upvotes.length * 0.5;
});

issueSchema.index({ status: 1 });
issueSchema.index({ severityScore: -1 });
issueSchema.index({ createdAt: -1 });

issueSchema.pre("save", function validateResolvedSeverity(next) {
  if (this.status === "resolved" && (this.severityScore === null || this.severityScore === undefined)) {
    return next(new Error("severityScore is required when status is resolved."));
  }

  return next();
});

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;