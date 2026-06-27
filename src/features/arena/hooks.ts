import { useMutation, useQuery } from "@tanstack/react-query";
import { getExamQuestions, submitExam } from "./api";
import type { ExamSubmit } from "./types";

export const useExamQuestions = (packageId: string) =>
  useQuery({
    queryKey: ["exam-questions", packageId],
    queryFn: () => getExamQuestions(packageId),
    enabled: !!packageId,
    staleTime: Infinity,
  });

export const useSubmitExam = () =>
  useMutation({
    mutationFn: (data: ExamSubmit) => submitExam(data),
  });
