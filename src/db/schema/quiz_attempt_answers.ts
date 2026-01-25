import { integer, pgTable, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { quizAttemptsTable } from "./quiz_attempts";
import { quizQuestionsTable } from "./quiz_questions";
import { questionOptionsTable } from "./question_options";

/**
 * Quiz Attempt Answers table
 * One row per question answered in an attempt.
 * selectedOptionId null = skipped; isCorrect false when wrong or skipped.
 */
export const quizAttemptAnswersTable = pgTable(
  "quiz_attempt_answers",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    attemptId: integer()
      .notNull()
      .references(() => quizAttemptsTable.id, { onDelete: "cascade" }),
    questionId: integer()
      .notNull()
      .references(() => quizQuestionsTable.id, { onDelete: "cascade" }),
    selectedOptionId: integer().references(() => questionOptionsTable.id, {
      onDelete: "set null",
    }),
    isCorrect: boolean().notNull(),
  },
  (t) => [uniqueIndex("quiz_attempt_answers_attempt_question").on(t.attemptId, t.questionId)]
);
