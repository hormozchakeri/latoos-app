export const DAILY_GOALS = [
  {
    id:              "casual",
    label:           "Casual",
    description:     "~5 min / day",
    cardsPerPackage: 10,
    emoji:           "🌱",
    color:           "#22C55E",
  },
  {
    id:              "regular",
    label:           "Regular",
    description:     "~10 min / day",
    cardsPerPackage: 15,
    emoji:           "📚",
    color:           "#3B82F6",
  },
  {
    id:              "serious",
    label:           "Serious",
    description:     "~15 min / day",
    cardsPerPackage: 20,
    emoji:           "🎯",
    color:           "#8B5CF6",
  },
  {
    id:              "intense",
    label:           "Intense",
    description:     "~20+ min / day",
    cardsPerPackage: 30,
    emoji:           "🔥",
    color:           "#EF4444",
  },
] as const;

export type DailyGoalId = typeof DAILY_GOALS[number]["id"];

export const DEFAULT_GOAL_ID: DailyGoalId = "regular";

export function getGoalById(id: DailyGoalId) {
  return DAILY_GOALS.find((g) => g.id === id) ?? DAILY_GOALS[1];
}
