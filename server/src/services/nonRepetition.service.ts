type Scenario = {
  id: string;
  type: "attack" | "genuine";
};

export function filterUsedScenarios(
  allScenarios: Scenario[],
  usedIds: string[]
) {
  return allScenarios.filter((s) => !usedIds.includes(s.id));
}
