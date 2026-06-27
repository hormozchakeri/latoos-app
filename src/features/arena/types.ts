export interface ExamQuestion {
  vocabId: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ExamAnswer {
  vocabId: string;
  selectedAnswer: string;
}

export interface ExamSubmit {
  packageId: string;
  answers: ExamAnswer[];
}

export interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
}
