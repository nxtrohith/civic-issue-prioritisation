const mongoose = require("mongoose");

const aiPredictionLogSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      unique: true
    },
    modelVersion: { type: String, required: true, trim: true },
    predictedIssueType: { type: String, trim: true },
    severityScore: { type: Number, min: 0, max: 10 },
    confidenceScore: { type: Number, min: 0, max: 1 }
  },
  {
    timestamps: true
  }
);

aiPredictionLogSchema.pre("save", function validateConfidenceRange(next) {
  if (
    this.confidenceScore !== null &&
    this.confidenceScore !== undefined &&
    (this.confidenceScore < 0 || this.confidenceScore > 1)
  ) {
    return next(new Error("confidenceScore must be between 0 and 1."));
  }

  return next();
});

const AIPredictionLog = mongoose.model("AIPredictionLog", aiPredictionLogSchema);

module.exports = AIPredictionLog;