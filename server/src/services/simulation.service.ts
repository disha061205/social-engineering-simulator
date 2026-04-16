import type { ScenarioType, TrainingScenario } from "../utils/scenarios";

export type AttemptConfig = {
  attackCount?: number;
  genuineCount?: number;
  usedScenarioIds?: string[];
  focusWeakAreas?: string[];
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => 0.5 - Math.random());
}

function weightedShuffle(scenarios: TrainingScenario[], focusWeakAreas: string[]) {
  if (!focusWeakAreas.length) return shuffle(scenarios);

  return shuffle(scenarios).sort((a, b) => {
    const aWeight = a.weakAreaTags.filter((tag) => focusWeakAreas.includes(tag)).length;
    const bWeight = b.weakAreaTags.filter((tag) => focusWeakAreas.includes(tag)).length;
    return bWeight - aWeight;
  });
}

function selectByIntent(
  allScenarios: TrainingScenario[],
  type: ScenarioType,
  count: number,
  usedScenarioIds: string[],
  focusWeakAreas: string[]
) {
  const matching = allScenarios.filter((scenario) => scenario.type === type);
  const unseen = matching.filter((scenario) => !usedScenarioIds.includes(scenario.id));
  const primaryPool = unseen.length >= count ? unseen : matching;
  return weightedShuffle(primaryPool, focusWeakAreas).slice(0, count);
}

export function generateScenarios(allScenarios: TrainingScenario[], config: AttemptConfig = {}) {
  const attackCount = config.attackCount ?? 3;
  const genuineCount = config.genuineCount ?? 2;
  const usedScenarioIds = config.usedScenarioIds ?? [];
  const focusWeakAreas = config.focusWeakAreas ?? [];

  const randomAttack = selectByIntent(allScenarios, "attack", attackCount, usedScenarioIds, focusWeakAreas);
  const randomGenuine = selectByIntent(allScenarios, "genuine", genuineCount, usedScenarioIds, focusWeakAreas);

  return shuffle([...randomAttack, ...randomGenuine]);
}
