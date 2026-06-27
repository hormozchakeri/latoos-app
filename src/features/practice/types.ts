export type Rating = "Hard" | "Good" | "Easy";

export interface PracticeCard {
  vocabId: string;
  packageId: string;
  packageName: string;
  question: string;
  answer: string;
  usage?: string;
  lastRating?: Rating;
  reviewCount: number;
  nextReviewAt?: string;
}

export interface RateCardInput {
  vocabId: string;
  packageId: string;
  rating: Rating;
}

export interface PackageProgress {
  packageId: string;
  totalCards: number;
  reviewedCards: number;
  progressPercent: number;
}
