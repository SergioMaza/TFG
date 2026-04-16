export function getScoreColorValue(score) {
  if (score > 75) return "var(--success)";
  if (score > 50) return "var(--warning)";
  return "var(--error)";
}