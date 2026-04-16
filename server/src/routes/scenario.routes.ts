import express from "express";
import Scenario from "../models/scenario.model";
import { scenarios as generatedScenarios } from "../utils/scenarios";

const router = express.Router();

function normalizeList(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item).trim()).filter(Boolean);
    return items.length ? items : fallback;
  }

  if (typeof value === "string") {
    const items = value
      .split(/\r?\n|[.;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length ? items : fallback;
  }

  return fallback;
}

function normalizeScenarioRecord(record: any) {
  return {
    ...record,
    id: record.id ?? record._id?.toString?.() ?? "",
    title: record.title ?? "Untitled scenario",
    attackType: record.attackType ?? "phishing",
    level: record.level ?? "easy",
    context: record.context ?? "email",
    content: record.content ?? "",
    visualVariant: record.visualVariant ?? `${record.context ?? "email"}-${record.level ?? "easy"}`,
    type: record.type ?? "attack",
    hiddenIntent: record.hiddenIntent ?? record.type ?? "attack",
    decisionOptions: normalizeList(record.decisionOptions, ["click", "ignore", "report", "verify"]),
    correctDecision: record.correctDecision ?? (record.type === "genuine" ? "verify" : "report"),
    explanation: record.explanation ?? "Review the sender, context, urgency, and requested action.",
    preventionTips: normalizeList(record.preventionTips ?? record.prevention, ["Verify through an official channel."]),
    postAttackActions: normalizeList(record.postAttackActions ?? record.solution, ["Report and contain the incident."]),
    weakAreaTags: normalizeList(record.weakAreaTags, ["verification"]),
    difficultyMarkers: normalizeList(record.difficultyMarkers, [record.level ?? "easy"]),
    moduleFlow: normalizeList(record.moduleFlow, ["Introduction", "Simulation", "User Decision", "Result", "Explanation", "Prevention", "Post-Attack Actions"])
  };
}

// 🔥 Add Scenario
router.post("/scenario", async (req, res) => {
  const scenario = await Scenario.create(req.body);
  res.json(scenario);
});

router.get("/scenario", async (req, res) => {
  const attackType = req.query.attackType as string;
  const level = req.query.level as string;

  const filter: any = {};

  if (attackType) filter.attackType = attackType;
  if (level) filter.level = level;

  const scenarios = await Scenario.find({ ...filter, status: { $ne: "archived" } }).lean();
  const databaseScenarios = scenarios.map((scenario: any) => ({
    ...normalizeScenarioRecord(scenario),
    source: "database"
  }));
  const generated = generatedScenarios.filter((scenario) => {
    return (!attackType || scenario.attackType === attackType) && (!level || scenario.level === level);
  }).map((scenario) => ({
    ...normalizeScenarioRecord(scenario),
    source: "built-in"
  }));

  res.json([...databaseScenarios, ...generated]);
});

router.put("/scenario/:id", async (req, res) => {
  const scenario = await Scenario.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(scenario);
});

// 🔥 Delete Scenario
router.delete("/scenario/:id", async (req, res) => {
  await Scenario.findByIdAndUpdate(req.params.id, { status: "archived" });
  res.json({ message: "Archived" });
});

export default router;
