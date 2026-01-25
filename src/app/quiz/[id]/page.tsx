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
  const quiz = await quizService.getQuiz(id);
  if (!quiz) notFound();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <TakeQuiz quiz={quiz} />
    </div>
  );
}
