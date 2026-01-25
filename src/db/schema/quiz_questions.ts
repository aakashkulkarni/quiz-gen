import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzes";

/**
 * Quiz Questions table
 * Stores individual questions for each quiz
 */
export const quizQuestionsTable = pgTable("quiz_questions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quizId: integer()
    .notNull()
    .references(() => quizzesTable.id, { onDelete: "cascade" }),
  questionText: text().notNull(),
  explanation: text(),
  order: integer().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
