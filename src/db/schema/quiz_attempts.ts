import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzes";

/**
 * Quiz Attempts table
 * One row per completed (or in-progress) attempt at a quiz.
 * Retaking a quiz creates a new row.
 */
export const quizAttemptsTable = pgTable("quiz_attempts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quizId: integer()
    .notNull()
    .references(() => quizzesTable.id, { onDelete: "cascade" }),
  completedAt: timestamp().notNull(),
  correctCount: integer().notNull(),
  totalQuestions: integer().notNull(),
});
