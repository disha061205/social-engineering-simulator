import mongoose from "mongoose";

const scenarioSchema = new mongoose.Schema({
  attackType: String,
  level: String,
  context: String,
  title: String,
  type: String, // attack or genuine
  hiddenIntent: String,
  content: String,
  visualVariant: String,
  decisionOptions: [String],
  correctDecision: String,
  explanation: String,
  prevention: String,
  preventionTips: [String],
  solution: String,
  postAttackActions: [String],
  weakAreaTags: [String],
  difficultyMarkers: [String],
  status: { type: String, default: "active" }
}, { timestamps: true });

scenarioSchema.index({ attackType: 1, level: 1, type: 1, status: 1 });

scenarioSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export default mongoose.model("Scenario", scenarioSchema);
