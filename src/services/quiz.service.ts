import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/config/database";
import {
  quizzesTable,
  quizQuestionsTable,
  questionOptionsTable,
  quizAttemptsTable,
  quizAttemptAnswersTable,
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
  ): Promise<QuizResult & { attemptId: number }> {
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

    const quizIdNum = parseInt(quizId, 10);
    if (Number.isNaN(quizIdNum)) throw new Error("Invalid quiz id");

    const attempt = await db.transaction(async (tx) => {
      const [a] = await tx
        .insert(quizAttemptsTable)
        .values({
          quizId: quizIdNum,
          completedAt: new Date(),
          correctCount: score,
          totalQuestions: quiz.questions.length,
        })
        .returning();
      if (!a) throw new Error("Failed to create attempt");
      for (const qr of questionResults) {
        await tx.insert(quizAttemptAnswersTable).values({
          attemptId: a.id,
          questionId: parseInt(qr.questionId, 10),
          selectedOptionId: qr.selectedOptionIds[0]
            ? parseInt(qr.selectedOptionIds[0], 10)
            : null,
          isCorrect: qr.isCorrect,
        });
      }
      return a;
    });

    return {
      quizId,
      score,
      totalQuestions: quiz.questions.length,
      maxScore: quiz.questions.length,
      questionResults,
      questions: quiz.questions,
      attemptId: attempt.id,
    };
  }

  async listQuizzes(): Promise<
    Array<{ id: string; topic: string; description?: string; createdAt: Date }>
  > {
    const rows = await db
      .select({
        id: quizzesTable.id,
        topic: quizzesTable.topic,
        description: quizzesTable.description,
        createdAt: quizzesTable.createdAt,
      })
      .from(quizzesTable)
      .orderBy(desc(quizzesTable.createdAt));
    return rows.map((r) => ({
      id: String(r.id),
      topic: r.topic,
      description: r.description ?? undefined,
      createdAt: r.createdAt,
    }));
  }

  async getAttemptsForQuiz(quizId: string): Promise<
    Array<{
      id: number;
      completedAt: Date;
      correctCount: number;
      totalQuestions: number;
    }>
  > {
    const id = parseInt(quizId, 10);
    if (Number.isNaN(id)) return [];
    const rows = await db
      .select({
        id: quizAttemptsTable.id,
        completedAt: quizAttemptsTable.completedAt,
        correctCount: quizAttemptsTable.correctCount,
        totalQuestions: quizAttemptsTable.totalQuestions,
      })
      .from(quizAttemptsTable)
      .where(eq(quizAttemptsTable.quizId, id))
      .orderBy(desc(quizAttemptsTable.completedAt));
    return rows;
  }

  async getAttemptById(
    quizId: string,
    attemptId: string
  ): Promise<(QuizResult & { attemptId: number }) | null> {
    const qId = parseInt(quizId, 10);
    const aId = parseInt(attemptId, 10);
    if (Number.isNaN(qId) || Number.isNaN(aId)) return null;

    const [attempt] = await db
      .select()
      .from(quizAttemptsTable)
      .where(eq(quizAttemptsTable.id, aId));
    if (!attempt || attempt.quizId !== qId) return null;

    const quiz = await this.getQuiz(quizId);
    if (!quiz) return null;

    const answerRows = await db
      .select()
      .from(quizAttemptAnswersTable)
      .where(eq(quizAttemptAnswersTable.attemptId, aId));

    const answersByQ = new Map(
      answerRows.map((a) => [a.questionId, a])
    );

    const questionResults: QuizResult["questionResults"] = quiz.questions.map(
      (q) => {
        const ans = answersByQ.get(parseInt(q.id, 10));
        return {
          questionId: q.id,
          isCorrect: ans?.isCorrect ?? false,
          selectedOptionIds: ans?.selectedOptionId
            ? [String(ans.selectedOptionId)]
            : [],
          correctOptionIds: q.options.filter((o) => o.isCorrect).map((o) => o.id),
          explanation: q.explanation,
        };
      }
    );

    return {
      quizId,
      score: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      maxScore: attempt.totalQuestions,
      questionResults,
      questions: quiz.questions,
      attemptId: attempt.id,
    };
  }
}
