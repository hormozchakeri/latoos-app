import api from "@/api/apiClient";
import type { ExamQuestion, ExamResult, ExamSubmit } from "./types";

export const getExamQuestions = async (packageId: string, count = 25): Promise<ExamQuestion[]> => {
  const res = await api.get(`/Arena/questions/${packageId}`, { params: { count } });
  return res.data;
};

export const submitExam = async (data: ExamSubmit): Promise<ExamResult> => {
  const res = await api.post("/Arena/submit", data);
  return res.data;
};
