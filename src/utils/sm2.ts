import type { Rating } from "@/features/practice/types";

export interface SrsState {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewAt: string;
  lastRating: Rating;
  reviewCount: number;
}

/** Mirrors the backend PracticeService SM-2 logic exactly. */
export function computeNextReview(
  current: {
    interval: number;
    repetitions: number;
    easeFactor: number;
    reviewCount: number;
  },
  rating: Rating
): SrsState {
  let { interval, repetitions, easeFactor } = current;
  const reviewCount = current.reviewCount + 1;

  if (rating === "Hard") {
    interval = 1;
    repetitions = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === "Good") {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    // Easy
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);
    interval = Math.round(interval * 1.3);
    easeFactor = Math.min(4.0, easeFactor + 0.15);
    repetitions += 1;
  }

  const next = new Date();
  next.setDate(next.getDate() + interval);

  return {
    interval,
    repetitions,
    easeFactor,
    nextReviewAt: next.toISOString(),
    lastRating: rating,
    reviewCount,
  };
}
