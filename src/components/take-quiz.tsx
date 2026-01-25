"use client";

import { useState } from "react";
import Link from "next/link";
import type { Quiz, QuizResult } from "@/types/quiz";
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

type TakeQuizProps = { quiz: Quiz };

export function TakeQuiz({ quiz }: TakeQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quiz/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "Failed to submit");
        return;
      }
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
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
                    qr.isCorrect ? "text-green-600 dark:text-green-400" : "text-destructive"
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
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/">Create another quiz</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{quiz.topic}</h1>
        {quiz.description && (
          <p className="mt-2 text-muted-foreground">{quiz.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((q) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-base">
                Question {q.order}: {q.questionText}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {q.options.map((opt) => {
                const selected = (answers[q.id] ?? []).includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent/50",
                      selected && "border-primary bg-accent"
                    )}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={selected}
                      onChange={() => selectOption(q.id, opt.id)}
                      className="h-4 w-4 border-input"
                    />
                    <span className="font-medium text-muted-foreground">{opt.optionLabel}. </span>
                    <span>{opt.optionText}</span>
                  </label>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit answers"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/">Back</Link>
          </Button>
        </div>
      </form>
    </>
  );
}
