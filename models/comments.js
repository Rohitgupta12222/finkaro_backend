const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  name: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Ensure correct export
module.exports = mongoose.model("Comment", commentSchema);
