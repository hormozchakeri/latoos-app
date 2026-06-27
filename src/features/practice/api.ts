import api from "@/api/apiClient";
import type { PackageProgress, PracticeCard, RateCardInput } from "./types";

export const getDailySession = async (cardsPerPackage?: number): Promise<PracticeCard[]> => {
  const res = await api.get("/Practice/daily-session", {
    params: cardsPerPackage ? { cardsPerPackage } : undefined,
  });
  return res.data;
};

export const getPracticeSession = async (packageId: string): Promise<PracticeCard[]> => {
  const res = await api.get(`/Practice/session/${packageId}`);
  return res.data;
};

export const rateCard = async (input: RateCardInput): Promise<void> => {
  await api.post("/Practice/rate", input);
};

export const getPackageProgress = async (packageId: string): Promise<PackageProgress> => {
  const res = await api.get(`/Practice/progress/${packageId}`);
  return res.data;
};
