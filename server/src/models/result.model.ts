import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  userId: String,
  attackType: String,
  level: String,
  score: Number,
  total: { type: Number, default: 5 },
  accuracy: Number,
  feedbackBand: String,
  attempt: Number,
  scenarios: [String],
  decisions: [{
    scenarioId: String,
    action: String,
    correct: Boolean,
    weakAreaTags: [String]
  }],
  weakAreas: [String],
  adaptiveRecommendation: String
}, { timestamps: true });

export default mongoose.model("Result", resultSchema);
