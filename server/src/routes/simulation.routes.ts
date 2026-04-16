import express from "express";
import Scenario from "../models/scenario.model";
import { generateScenarios } from "../services/simulation.service";
import { scenarios as generatedScenarios, type TrainingScenario } from "../utils/scenarios";

const router = express.Router();

router.get("/simulate", async (req, res) => {
  const attackType = (req.query.attackType as string) || "phishing";
  const level = (req.query.level as string) || "easy";
  const usedScenarioIds = typeof req.query.used === "string" && req.query.used.length
    ? req.query.used.split(",")
    : [];
  const focusWeakAreas = typeof req.query.focus === "string" && req.query.focus.length
    ? req.query.focus.split(",")
    : [];

  const filter: any = {};

  if (attackType) filter.attackType = attackType;
  if (level) filter.level = level;
  filter.status = { $ne: "archived" };

  const dbScenarios = await Scenario.find(filter);

  const dbPool: TrainingScenario[] = dbScenarios.map((s: any) => ({
      id: s._id.toString(),
      title: s.title ?? "Untitled scenario",
      attackType: s.attackType,
      level: s.level,
      context: s.context ?? "email",
      content: s.content,
      visualVariant: s.visualVariant ?? `${s.context ?? "email"}-${s.level}`,
      type: s.type,
      hiddenIntent: s.hiddenIntent ?? s.type,
      decisionOptions: s.decisionOptions?.length ? s.decisionOptions : ["click", "ignore", "report", "verify"],
      correctDecision: s.correctDecision ?? (s.type === "attack" ? "report" : "verify"),
      explanation: s.explanation ?? "Review the sender, context, urgency, and requested action.",
      preventionTips: s.preventionTips?.length ? s.preventionTips : [s.prevention ?? "Verify through an official channel."],
      postAttackActions: s.postAttackActions?.length ? s.postAttackActions : [s.solution ?? "Report and contain the incident."],
      weakAreaTags: s.weakAreaTags?.length ? s.weakAreaTags : ["verification"],
      difficultyMarkers: s.difficultyMarkers?.length ? s.difficultyMarkers : [s.level],
      moduleFlow: ["Introduction", "Simulation", "User Decision", "Result", "Explanation", "Prevention", "Post-Attack Actions"]
    }));

  const generatedPool = generatedScenarios.filter((scenario) => scenario.attackType === attackType && scenario.level === level);
  const hasCompleteDbPool =
    dbPool.filter((scenario) => scenario.type === "attack").length >= 3 &&
    dbPool.filter((scenario) => scenario.type === "genuine").length >= 2;
  const scenarios: TrainingScenario[] = hasCompleteDbPool ? dbPool : generatedPool;

  const result = generateScenarios(scenarios, { usedScenarioIds, focusWeakAreas });

  res.json({
    attackType,
    level,
    attemptRules: {
      totalScenarios: 5,
      attackScenarios: 3,
      genuineScenarios: 2,
      nonRepetition: "avoid previously seen scenario IDs; fall back only when the pool is exhausted"
    },
    scenarios: result
  });
});

export default router;
