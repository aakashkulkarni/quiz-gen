"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Quiz, QuizResult } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttemptResultView } from "@/components/attempt-result-view";
import { cn } from "@/lib/utils";

type Attempt = {
  id: number;
  completedAt: string;
  correctCount: number;
  totalQuestions: number;
};

function PastAttemptsSection({
  quizId,
  attempts,
  className,
}: {
  quizId: string;
  attempts: Attempt[];
  className?: string;
}) {
  if (attempts.length === 0) return null;
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Past attempts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {attempts.map((a) => (
            <li key={a.id}>
              <Link
                href={`/quiz/${quizId}/attempts/${a.id}`}
                className="block rounded-md border p-3 transition-colors hover:bg-accent/50"
              >
                <span className="font-medium">
                  {a.correctCount}/{a.totalQuestions} correct
                </span>
                <p className="text-muted-foreground text-sm">
                  {new Date(a.completedAt).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

type TakeQuizProps = { quiz: Quiz };

export function TakeQuiz({ quiz }: TakeQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(QuizResult & { attemptId?: number }) | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const fetchAttempts = useCallback(() => {
    fetch(`/api/quiz/${quiz.id}/attempts`)
      .then((r) => r.json())
      .then((d) => d.attempts && setAttempts(d.attempts))
      .catch(() => {});
  }, [quiz.id]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

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
      fetchAttempts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <>
        {attempts.length > 0 && (
          <PastAttemptsSection quizId={quiz.id} attempts={attempts} className="mb-8" />
        )}
        <AttemptResultView
          result={result}
          quizId={quiz.id}
          secondaryLink={{ label: "Create another quiz", href: "/" }}
          onRetake={() => {
            setResult(null);
            setAnswers({});
          }}
        />
      </>
    );
  }

  return (
    <>
      {attempts.length > 0 && (
        <PastAttemptsSection quizId={quiz.id} attempts={attempts} className="mb-8" />
      )}
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
