export interface QuestionOption {
  id: string;
  optionText: string;
  optionLabel?: string;
  isCorrect: boolean;
  order: number;
}

export interface Question {
  id: string;
  questionText: string;
  explanation?: string;
  order: number;
  options: QuestionOption[];
}

export interface Quiz {
  id: string;
  topic: string;
  description?: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizSubmission {
  quizId: string;
  answers: Record<string, string[]>;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  maxScore: number;
  questionResults: Array<{
    questionId: string;
    isCorrect: boolean;
    selectedOptionIds: string[];
    correctOptionIds: string[];
    explanation?: string;
  }>;
  questions: Question[];
}
