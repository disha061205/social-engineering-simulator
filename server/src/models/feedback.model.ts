import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  userId: String,
  attemptId: String,
  attackType: String,
  level: String,
  rating: Number,
  comments: String
}, { timestamps: true });

export default mongoose.model("Feedback", feedbackSchema);
