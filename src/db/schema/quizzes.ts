import { integer, pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";

/**
 * Quizzes table
 * Stores quiz metadata
 */
export const quizzesTable = pgTable("quizzes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  topic: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
