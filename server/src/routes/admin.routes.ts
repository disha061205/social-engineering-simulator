import express from "express";
import Result from "../models/result.model";
import User from "../models/user.model";
import Feedback from "../models/feedback.model";

const router = express.Router();

router.get("/admin/analytics", async (req, res) => {
  const learnerUsers = await User.find({
    role: "user",
    email: { $not: /@example\.com$/ }
  }).lean();
  const learnerUserIds = learnerUsers.map((user) => user._id.toString());
  const learnerDirectory = new Map(
    learnerUsers.map((user) => [
      user._id.toString(),
      {
        userName: user.name || "Learner",
        userEmail: user.email || ""
      }
    ])
  );
  const attemptedLearnerIds = await Result.distinct("userId", { userId: { $in: learnerUserIds } });
  const totalUsers = attemptedLearnerIds.length;
  const totalRegisteredLearners = learnerUsers.length;
  const totalAccounts = await User.countDocuments();

  const avgScore = await Result.aggregate([
    { $group: { _id: null, avg: { $avg: "$score" } } }
  ]);

  const mostFailedAttackType = await Result.aggregate([
    { $match: { score: { $lte: 2 } } },
    { $group: { _id: "$attackType", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  const weakAreas = await Result.aggregate([
    { $unwind: "$weakAreas" },
    { $group: { _id: "$weakAreas", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 }
  ]);

  const attempts = await Result.find({ userId: { $in: learnerUserIds } })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();
  const feedback = await Feedback.find().sort({ createdAt: -1 }).limit(10);

  const enrichedAttempts = attempts.map((attempt) => {
    const attemptUserId = String(attempt.userId ?? "");
    return {
      ...attempt,
      userName: learnerDirectory.get(attemptUserId)?.userName ?? "Unknown learner",
      userEmail: learnerDirectory.get(attemptUserId)?.userEmail ?? ""
    };
  });

  res.json({
    totalUsers,
    totalRegisteredLearners,
    totalAccounts,
    averageScore: Number((avgScore[0]?.avg || 0).toFixed(2)),
    mostFailedAttackType: mostFailedAttackType[0]?._id ?? "No failures yet",
    weakAreas,
    attempts: enrichedAttempts,
    feedback,
    levelConfiguration: {
      scenarioCount: 5,
      attackCount: 3,
      genuineCount: 2,
      passThreshold: "3-4 improves difficulty; 5 unlocks next level"
    },
    contentManagement: [
      "Prevention tips",
      "Recovery steps",
      "Learning content",
      "Attack introductions",
      "Decision feedback"
    ]
  });
});

export default router;
