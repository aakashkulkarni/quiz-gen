"use client";

import Link from "next/link";
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
};

export function AttemptResultView({
  result,
  quizId,
  secondaryLink,
}: AttemptResultViewProps) {
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
          return (
            <div key={qr.questionId} className="space-y-2 rounded-lg border p-4">
              <p className="font-medium">{q.questionText}</p>
              <p
                className={cn(
                  "text-sm",
                  qr.isCorrect
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive"
                )}
              >
                {qr.isCorrect ? "Correct" : "Incorrect"}
              </p>
              {qr.explanation && (
                <p className="text-muted-foreground text-sm">{qr.explanation}</p>
              )}
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href={`/quiz/${quizId}`}>Retake</Link>
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
