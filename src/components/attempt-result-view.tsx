"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuizResult } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AttemptResultViewProps = {
  result: QuizResult;
  quizId: string;
  /** e.g. { label: "Create another quiz", href: "/" } or { label: "Back to quiz", href: `/quiz/${id}` } */
  secondaryLink?: { label: string; href: string };
  /** When provided, Retake runs this instead of navigating (e.g. when already on quiz page). No loading. */
  onRetake?: () => void;
};

export function AttemptResultView({
  result,
  quizId,
  secondaryLink,
  onRetake,
}: AttemptResultViewProps) {
  const router = useRouter();
  const [retakeLoading, setRetakeLoading] = useState(false);

  function handleRetake() {
    if (onRetake) {
      onRetake();
      return;
    }
    setRetakeLoading(true);
    router.push(`/quiz/${quizId}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz results</CardTitle>
        <CardDescription>
          You scored {result.score} out of {result.maxScore}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {result.questionResults.map((qr) => {
          const q = result.questions.find((x) => x.id === qr.questionId)!;
          const options = [...q.options].sort((a, b) => a.order - b.order);
          return (
            <div key={qr.questionId} className="space-y-3 rounded-lg border p-4">
              <p className="font-medium">{q.questionText}</p>
              <div className="space-y-2">
                {options.map((opt) => {
                  const isCorrect = opt.isCorrect;
                  const isSelected = qr.selectedOptionIds.includes(opt.id);
                  const isWrongChoice = isSelected && !isCorrect;
                  return (
                    <div
                      key={opt.id}
                      className={cn(
                        "rounded-md border p-3 text-sm",
                        isCorrect &&
                          "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40",
                        isWrongChoice &&
                          "border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
                      )}
                    >
                      <span className="font-medium text-muted-foreground">
                        {opt.optionLabel}.{" "}
                      </span>
                      <span>{opt.optionText}</span>
                      {isSelected && (
                        <span className="ml-2 text-muted-foreground">
                          (Your choice)
                        </span>
                      )}
                      {isCorrect && qr.explanation && (
                        <p className="mt-2 border-t border-green-200 pt-2 text-muted-foreground dark:border-green-800/50">
                          {qr.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleRetake}
          disabled={onRetake ? false : retakeLoading}
        >
          {!onRetake && retakeLoading ? "Loading…" : "Retake"}
        </Button>
        {secondaryLink && (
          <Button asChild variant="outline">
            <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
