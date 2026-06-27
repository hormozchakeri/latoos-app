export type EnrollmentStatus = "Active" | "Expired" | "Cancelled";

export interface Enrollment {
  id: string;
  packageId: string;
  packageName: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  totalCards: number;
  reviewedCards: number;
  progressPercent: number;
}

export interface IsEnrolledResponse {
  isEnrolled: boolean;
}
