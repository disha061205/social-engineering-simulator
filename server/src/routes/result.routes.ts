import express from "express";
import Result from "../models/result.model";
import Feedback from "../models/feedback.model";

const router = express.Router();

router.get("/results/:userId", async (req, res) => {
  const { userId } = req.params;

  const results = await Result.find({ userId }).sort({ createdAt: -1 });

  res.json(results);
});

router.post("/feedback", async (req, res) => {
  const feedback = await Feedback.create(req.body);
  res.status(201).json(feedback);
});

export default router;
