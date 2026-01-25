import { integer, pgTable, text, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { quizQuestionsTable } from "./quiz_questions";

/**
 * Question Options table
 * Stores answer options for each question
 */
export const questionOptionsTable = pgTable("question_options", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  questionId: integer()
    .notNull()
    .references(() => quizQuestionsTable.id, { onDelete: "cascade" }),
  optionText: text().notNull(),
  optionLabel: varchar({ length: 10 }),
  isCorrect: boolean().notNull().default(false),
  order: integer().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
