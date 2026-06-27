import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import { getVocabsByPackage, upsertVocab } from "@/db/vocabs";
import { upsertProgress } from "@/db/practiceProgress";
import { enqueue } from "@/db/syncQueue";
import { computeNextReview } from "@/utils/sm2";
import { getDailySession, getPracticeSession, getPackageProgress, rateCard } from "./api";
import type { PracticeCard, RateCardInput } from "./types";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/db/database";
import { useDailyGoal } from "@/hooks/useDailyGoal";

function generateId(): string {
  try {
    return uuidv4();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

function getUserId(token: string | null): string | null {
  if (!token) return null;
  try {
    return jwtDecode<{ sub: string }>(token).sub ?? null;
  } catch {
    return null;
  }
}

/** Build practice cards from local SQLite for one package. */
async function buildOfflineCards(
  packageId: string,
  userId: string
): Promise<PracticeCard[]> {
  const db = await getDb();
  const now = new Date().toISOString();

  // vocabs due for review (nextReviewAt <= now OR never reviewed)
  // CASE-based sort instead of NULLS FIRST for broad SQLite compatibility
  const rows = await db.getAllAsync<any>(
    `SELECT v.*, pp.lastRating, pp.reviewCount, pp.nextReviewAt
     FROM vocabs v
     LEFT JOIN practice_progress pp
       ON pp.vocabId = v.id AND pp.userId = ?
     WHERE v.packageId = ?
       AND (pp.nextReviewAt IS NULL OR pp.nextReviewAt <= ?)
     ORDER BY CASE WHEN pp.nextReviewAt IS NULL THEN 0 ELSE 1 END,
              pp.nextReviewAt ASC
     LIMIT 20`,
    [userId, packageId, now]
  );

  return rows.map((r: any) => ({
    vocabId:     r.id,
    packageId,
    packageName: "",
    question:    r.vocabulary,
    answer:      r.meaning ?? "",
    usage:       r.example1 ?? undefined,
    lastRating:  r.lastRating ?? undefined,
    reviewCount: r.reviewCount ?? 0,
    nextReviewAt: r.nextReviewAt ?? undefined,
  }));
}

export const useDailySession = () => {
  const { userToken } = useAuth();
  const { isOnline } = useSync();
  const userId = getUserId(userToken);
  const { goal } = useDailyGoal();

  return useQuery({
    queryKey: ["daily-session", userId, goal.cardsPerPackage],
    staleTime: 0,
    queryFn: async (): Promise<PracticeCard[]> => {
      if (isOnline) {
        try {
          const cards = await getDailySession(goal.cardsPerPackage);
          for (const card of cards) {
            await upsertVocab({
              id:        card.vocabId,
              packageId: card.packageId,
              vocabulary: card.question,
              type: "", voice: "",
              meaning:  card.answer,
              example1: card.usage,
              synced:   true,
            });
          }
          return cards;
        } catch {
          // Fall through to offline
        }
      }

      if (!userId) return [];

      // Offline: gather cards from enrolled packages AND owned packages
      const db = await getDb();
      const now = new Date().toISOString();
      const rows = await db.getAllAsync<any>(
        `SELECT v.*, pp.lastRating, pp.reviewCount, pp.nextReviewAt,
                COALESCE(e.packageName, p.packageName) AS packageName
         FROM vocabs v
         LEFT JOIN enrollments e ON e.packageId = v.packageId
         LEFT JOIN packages p ON p.id = v.packageId AND p.isOwner = 1
         LEFT JOIN practice_progress pp ON pp.vocabId = v.id AND pp.userId = ?
         WHERE (e.packageId IS NOT NULL OR p.id IS NOT NULL)
           AND (pp.nextReviewAt IS NULL OR pp.nextReviewAt <= ?)
         ORDER BY CASE WHEN pp.nextReviewAt IS NULL THEN 0 ELSE 1 END,
                  pp.nextReviewAt ASC
         LIMIT ?`,
        [userId, now, goal.cardsPerPackage * 4]
      );

      return rows.map((r: any) => ({
        vocabId:     r.id,
        packageId:   r.packageId,
        packageName: r.packageName ?? "",
        question:    r.vocabulary,
        answer:      r.meaning ?? "",
        usage:       r.example1 ?? undefined,
        lastRating:  r.lastRating ?? undefined,
        reviewCount: r.reviewCount ?? 0,
        nextReviewAt: r.nextReviewAt ?? undefined,
      }));
    },
    enabled: !!userId,
  });
};

export const usePracticeSession = (packageId: string) => {
  const { userToken } = useAuth();
  const { isOnline } = useSync();
  const userId = getUserId(userToken);

  return useQuery({
    queryKey: ["practice-session", packageId, isOnline],
    queryFn: async (): Promise<PracticeCard[]> => {
      if (isOnline) {
        try {
          const cards = await getPracticeSession(packageId);
          for (const card of cards) {
            await upsertVocab({
              id:        card.vocabId,
              packageId: card.packageId,
              vocabulary: card.question,
              type: "", voice: "",
              meaning:  card.answer,
              example1: card.usage,
              synced:   true,
            });
          }
          return cards;
        } catch {
          // Fall through to offline
        }
      }
      if (!userId) return [];
      try {
        return await buildOfflineCards(packageId, userId);
      } catch {
        return [];
      }
    },
    enabled: !!packageId,
  });
};

export const usePackageProgress = (packageId: string) =>
  useQuery({
    queryKey: ["package-progress", packageId],
    queryFn: () => getPackageProgress(packageId),
    enabled: !!packageId,
  });

export const useRateCard = () => {
  const queryClient = useQueryClient();
  const { userToken } = useAuth();
  const { isOnline, triggerSync } = useSync();
  const userId = getUserId(userToken);

  return useMutation({
    mutationFn: async (input: RateCardInput) => {
      // Compute SM-2 locally
      const db = await getDb();
      const existing = await db.getFirstAsync<any>(
        `SELECT * FROM practice_progress WHERE userId = ? AND vocabId = ?`,
        [userId ?? "", input.vocabId]
      );

      const current = {
        interval:    existing?.interval_days  ?? 0,
        repetitions: existing?.repetitions    ?? 0,
        easeFactor:  existing?.easeFactor     ?? 2.5,
        reviewCount: existing?.reviewCount    ?? 0,
      };

      const next = computeNextReview(current, input.rating);

      const progressId = existing?.id ?? generateId();
      await upsertProgress({
        id:            progressId,
        userId:        userId ?? "",
        vocabId:       input.vocabId,
        packageId:     input.packageId,
        lastRating:    next.lastRating,
        reviewCount:   next.reviewCount,
        lastReviewedAt: new Date().toISOString(),
        intervalDays:  next.interval,
        repetitions:   next.repetitions,
        easeFactor:    next.easeFactor,
        nextReviewAt:  next.nextReviewAt,
        synced:        false,
      });

      if (isOnline) {
        try {
          await rateCard(input);
          await db.runAsync(
            `UPDATE practice_progress SET synced = 1 WHERE id = ?`,
            [progressId]
          );
          return;
        } catch {
          // fall through to queue
        }
      }

      await enqueue("RATE_CARD", {
        progressId,
        vocabId:   input.vocabId,
        packageId: input.packageId,
        rating:    input.rating,
      });

      if (isOnline) triggerSync();
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ["package-progress", input.packageId] });
      queryClient.invalidateQueries({ queryKey: ["daily-session"] });
    },
  });
};
