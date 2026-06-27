import * as SecureStore from "expo-secure-store";
import {
  DAILY_GOALS,
  DEFAULT_GOAL_ID,
  getGoalById,
  type DailyGoalId,
} from "@/constants/dailyGoals";

const KEY = "daily_goal";

export async function getSavedGoalId(): Promise<DailyGoalId | null> {
  const stored = await SecureStore.getItemAsync(KEY);
  if (stored && DAILY_GOALS.some((g) => g.id === stored)) {
    return stored as DailyGoalId;
  }
  return null;
}

export async function getDailyGoalId(): Promise<DailyGoalId> {
  return (await getSavedGoalId()) ?? DEFAULT_GOAL_ID;
}

export async function saveDailyGoalId(id: DailyGoalId): Promise<void> {
  await SecureStore.setItemAsync(KEY, id);
}

export { getGoalById };
