type Scenario = {
  id: string;
  type: "attack" | "genuine";
  correctDecision?: "click" | "ignore" | "report" | "verify";
  weakAreaTags?: string[];
  explanation?: string;
  preventionTips?: string[];
  postAttackActions?: string[];
  title?: string;
};

type UserDecision = {
  scenarioId: string;
  action: "click" | "ignore" | "report" | "verify";
};

export function calculateScore(
  scenarios: Scenario[],
  decisions: UserDecision[]
) {
  let score = 0;

  const results = scenarios.map((scenario) => {
    const decision = decisions.find(
      (d) => d.scenarioId === scenario.id
    );

    let correct = false;

    if (scenario.correctDecision) {
      correct = decision?.action === scenario.correctDecision;
    } else if (scenario.type === "attack") {
      correct = decision?.action === "report" || decision?.action === "verify";
    } else {
      correct = decision?.action === "click" || decision?.action === "verify";
    }

    if (correct) score++;

    return {
      scenarioId: scenario.id,
      title: scenario.title,
      selectedAction: decision?.action,
      correctAction: scenario.correctDecision,
      correct,
      explanation: scenario.explanation,
      preventionTips: scenario.preventionTips ?? [],
      postAttackActions: scenario.postAttackActions ?? [],
      weakAreaTags: scenario.weakAreaTags ?? [],
    };
  });

  const weakAreas = Array.from(
    new Set(results.filter(r => !r.correct).flatMap((result) => result.weakAreaTags))
  );
  const accuracy = scenarios.length ? (score / scenarios.length) * 100 : 0;
  const feedbackBand = score === 5
    ? "Excellent cybersecurity awareness"
    : score >= 3
      ? "Good, needs improvement"
      : "High risk";

return {
  score,
  total: scenarios.length,
  accuracy,
  feedbackBand,
  results,
  weakAreas
};
}
