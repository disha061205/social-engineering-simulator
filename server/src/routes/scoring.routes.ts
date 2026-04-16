import Result from "../models/result.model";
import express from "express";
import { calculateScore } from "../services/scoring.service";
import { getNextLevel } from "../services/adaptive.service";

const router = express.Router();

router.post("/score", async (req, res) => {
  const { scenarios, decisions, userId, attackType, level } = req.body;

  const result = calculateScore(scenarios, decisions);
  const adaptiveRecommendation = getNextLevel(result.score, result.total);
  const previousAttempts = userId
    ? await Result.countDocuments({ userId, attackType, level })
    : 0;

  const newResult = new Result({
    userId,
    attackType,
    level,
    score: result.score,
    total: result.total,
    accuracy: result.accuracy,
    feedbackBand: result.feedbackBand,
    attempt: previousAttempts + 1,
    scenarios: scenarios.map((scenario: { id: string }) => scenario.id),
    decisions: result.results.map((item) => ({
      scenarioId: item.scenarioId,
      action: item.selectedAction,
      correct: item.correct,
      weakAreaTags: item.weakAreaTags
    })),
    weakAreas: result.weakAreas,
    adaptiveRecommendation
  });

  await newResult.save();

  res.json({
    ...result,
    attemptId: newResult._id,
    attempt: previousAttempts + 1,
    adaptiveRecommendation
  });
});

export default router;
