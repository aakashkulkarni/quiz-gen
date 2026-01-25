import { z } from "zod";

const optionLabels = ["A", "B", "C", "D"] as const;

export const quizOptionSchema = z.object({
  text: z.string().min(1).describe("The answer option text"),
  isCorrect: z.boolean().describe("Whether this option is the correct answer"),
});

export const quizQuestionSchema = z
  .object({
    questionText: z.string().min(1).describe("The multiple-choice question text"),
    options: z
      .array(quizOptionSchema)
      .length(4)
      .describe("Exactly 4 options; exactly one must have isCorrect: true")
      .refine(
        (opts) => opts.filter((o) => o.isCorrect).length === 1,
        "Exactly one option must be marked as correct"
      ),
    explanation: z.string().describe("Brief explanation of why the correct answer is right; use empty string if the question is self-evident"),
  });

export const generatedQuizSchema = z.object({
  questions: z.array(quizQuestionSchema).length(5).describe("Exactly 5 multiple-choice questions on the given topic"),
});

export type GeneratedQuiz = z.infer<typeof generatedQuizSchema>;
export type GeneratedQuizQuestion = z.infer<typeof quizQuestionSchema>;
export type GeneratedQuizOption = z.infer<typeof quizOptionSchema>;
export const OPTION_LABELS = optionLabels;
