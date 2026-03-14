const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    role: { type: String, enum: ["resident", "admin"], default: "resident" },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

userSchema.index({ role: 1 });

userSchema.pre("save", async function validateSingleAdmin(next) {
  if (this.role !== "admin") {
    return next();
  }

  const existingAdmin = await this.constructor.findOne({
    role: "admin",
    _id: { $ne: this._id }
  });

  if (existingAdmin) {
    return next(new Error("Only one admin user is allowed."));
  }

  return next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;