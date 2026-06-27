import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_GOAL_ID,
  getGoalById,
  type DailyGoalId,
} from "@/constants/dailyGoals";
import {
  getDailyGoalId,
  getSavedGoalId,
  saveDailyGoalId,
} from "@/services/dailyGoalStorage";

export function useDailyGoal() {
  const [goalId, setGoalId] = useState<DailyGoalId>(DEFAULT_GOAL_ID);
  const [isGoalSet, setIsGoalSet] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    getSavedGoalId().then((saved) => {
      setIsGoalSet(saved !== null);
      setGoalId(saved ?? DEFAULT_GOAL_ID);
    });
  }, []);

  const updateGoal = useCallback(async (id: DailyGoalId) => {
    await saveDailyGoalId(id);
    setGoalId(id);
    setIsGoalSet(true);
  }, []);

  return {
    goal: getGoalById(goalId),
    goalId,
    isGoalSet,
    updateGoal,
  };
}
