import { notFound } from "next/navigation";
import { QuizService } from "@/services";
import { TakeQuiz } from "@/components/take-quiz";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quizService = new QuizService();
  const [quiz, attemptsRows] = await Promise.all([
    quizService.getQuiz(id),
    quizService.getAttemptsForQuiz(id),
  ]);
  if (!quiz) notFound();

  const initialAttempts = attemptsRows.map((a) => ({
    id: a.id,
    completedAt: a.completedAt.toISOString(),
    correctCount: a.correctCount,
    totalQuestions: a.totalQuestions,
  }));

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <TakeQuiz quiz={quiz} initialAttempts={initialAttempts} />
    </div>
  );
}
