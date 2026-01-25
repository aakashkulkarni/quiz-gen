import { eq, inArray } from "drizzle-orm";
import { db } from "@/config/database";
import {
  quizzesTable,
  quizQuestionsTable,
  questionOptionsTable,
} from "@/db/schema";
import type { Quiz, QuizResult } from "@/types/quiz";
import { AIService } from "./ai";

export class QuizService {
  constructor(private readonly ai: AIService = new AIService()) {}

  async generateQuiz(
    topic: string,
    description?: string
  ): Promise<{
    quiz: Quiz & { createdAt: Date; updatedAt: Date };
  }> {
    const { questions } = await this.ai.generateQuiz(topic, description);

    const [quizRow] = await db
      .insert(quizzesTable)
      .values({ topic, description: description ?? null })
      .returning();
    if (!quizRow) throw new Error("Failed to create quiz");
    const quizId = quizRow.id;

    const questionRows = await db
      .insert(quizQuestionsTable)
      .values(
        questions.map((q, i) => ({
          quizId,
          questionText: q.questionText,
          explanation: q.explanation ?? null,
          order: i + 1,
        }))
      )
      .returning();

    const allOptionValues: Array<{
      questionId: number;
      optionText: string;
      optionLabel: string | null;
      isCorrect: boolean;
      order: number;
    }> = [];
    for (let i = 0; i < questionRows.length; i++) {
      const q = questions[i];
      for (const o of q.options) {
        allOptionValues.push({
          questionId: questionRows[i]!.id,
          optionText: o.optionText,
          optionLabel: o.optionLabel ?? null,
          isCorrect: o.isCorrect,
          order: o.order,
        });
      }
    }
    const optionRows =
      allOptionValues.length > 0
        ? await db
            .insert(questionOptionsTable)
            .values(allOptionValues)
            .returning()
        : [];

    const optsPerQ = 4;
    const resQuestions = questionRows.map((qr, i) => ({
      id: String(qr.id),
      questionText: qr.questionText,
      explanation: qr.explanation ?? undefined,
      order: qr.order,
      options: optionRows
        .slice(i * optsPerQ, (i + 1) * optsPerQ)
        .map((o) => ({
          id: String(o.id),
          optionText: o.optionText,
          optionLabel: o.optionLabel ?? undefined,
          isCorrect: o.isCorrect,
          order: o.order,
        })),
    }));

    return {
      quiz: {
        id: String(quizId),
        topic: quizRow.topic,
        description: quizRow.description ?? undefined,
        questions: resQuestions,
        createdAt: quizRow.createdAt,
        updatedAt: quizRow.updatedAt,
      },
    };
  }

  async getQuiz(quizId: string): Promise<Quiz | null> {
    const id = parseInt(quizId, 10);
    if (Number.isNaN(id)) return null;

    const [quiz] = await db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.id, id));
    if (!quiz) return null;

    const questionRows = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, quiz.id))
      .orderBy(quizQuestionsTable.order);

    const qIds = questionRows.map((q) => q.id);
    const optionRows =
      qIds.length > 0
        ? await db
            .select()
            .from(questionOptionsTable)
            .where(inArray(questionOptionsTable.questionId, qIds))
            .orderBy(questionOptionsTable.order)
        : [];

    const optsByQ = new Map<number, typeof optionRows>();
    for (const o of optionRows) {
      const arr = optsByQ.get(o.questionId) ?? [];
      arr.push(o);
      optsByQ.set(o.questionId, arr);
    }

    const questions = questionRows.map((qr) => ({
      id: String(qr.id),
      questionText: qr.questionText,
      explanation: qr.explanation ?? undefined,
      order: qr.order,
      options: (optsByQ.get(qr.id) ?? []).map((o) => ({
        id: String(o.id),
        optionText: o.optionText,
        optionLabel: o.optionLabel ?? undefined,
        isCorrect: o.isCorrect,
        order: o.order,
      })),
    }));

    return {
      id: String(quiz.id),
      topic: quiz.topic,
      description: quiz.description ?? undefined,
      questions,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };
  }

  async submitQuiz(
    quizId: string,
    answers: Record<string, string[]>
  ): Promise<QuizResult> {
    const quiz = await this.getQuiz(quizId);
    if (!quiz) throw new Error("Quiz not found");

    const questionResults: QuizResult["questionResults"] = [];
    let score = 0;

    for (const q of quiz.questions) {
      const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      const selected = answers[q.id] ?? [];
      const selectedSet = new Set(selected);
      const correctSet = new Set(correctIds);
      const isCorrect =
        selectedSet.size === correctSet.size &&
        [...selectedSet].every((id) => correctSet.has(id));
      if (isCorrect) score++;

      const correctOpt = q.options.find((o) => o.isCorrect);
      questionResults.push({
        questionId: q.id,
        isCorrect,
        selectedOptionIds: selected,
        correctOptionIds: correctIds,
        explanation: correctOpt ? q.explanation : undefined,
      });
    }

    return {
      quizId,
      score,
      totalQuestions: quiz.questions.length,
      maxScore: quiz.questions.length,
      questionResults,
      questions: quiz.questions,
    };
  }
}
