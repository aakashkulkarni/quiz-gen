export interface GenerateQuizRequest {
  topic: string;
  description?: string;
}

export interface GenerateQuizResponse {
  quiz: {
    id: string;
    topic: string;
    description?: string;
    questions: Array<{
      id: string;
      questionText: string;
      explanation?: string;
      order: number;
      options: Array<{
        id: string;
        optionText: string;
        optionLabel?: string;
        isCorrect: boolean;
        order: number;
      }>;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SubmitQuizRequest {
  quizId: string;
  answers: Record<string, string[]>;
}

export interface SubmitQuizResponse {
  result: {
    quizId: string;
    attemptId: number;
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
    questions: Array<{
      id: string;
      questionText: string;
      explanation?: string;
      order: number;
      options: Array<{
        id: string;
        optionText: string;
        optionLabel?: string;
        isCorrect: boolean;
        order: number;
      }>;
    }>;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
