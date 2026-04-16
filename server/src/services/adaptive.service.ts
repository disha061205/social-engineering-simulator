export function getNextLevel(score: number, total: number) {
  const accuracy = (score / total) * 100;

  if (accuracy === 100) return "unlock-next-level";
  if (accuracy >= 60) return "increase-difficulty-with-weak-area-review";
  return "retry-same-or-easier-level-with-weak-area-focus";
}
