import { notFound } from "next/navigation";
import { QuizService } from "@/services";
import { AttemptResultView } from "@/components/attempt-result-view";

export default async function AttemptReviewPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id: quizId, attemptId } = await params;
  const quizService = new QuizService();
  const result = await quizService.getAttemptById(quizId, attemptId);
  if (!result) notFound();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <AttemptResultView
        result={result}
        quizId={quizId}
        secondaryLink={{ label: "Back to quiz", href: `/quiz/${quizId}` }}
      />
    </div>
  );
}
