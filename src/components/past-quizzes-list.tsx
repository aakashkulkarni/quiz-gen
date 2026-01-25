"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuizSummary = {
  id: string;
  topic: string;
  description?: string;
  createdAt: string;
};

export function PastQuizzesList() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quizzes")
      .then((r) => r.json())
      .then((d) => {
        if (d.quizzes) setQuizzes(d.quizzes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Past quizzes</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Past quizzes</CardTitle>
        <CardDescription>
          Quizzes you&apos;ve created. Click to take or review attempts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {quizzes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/quiz/${q.id}`}
                className="block rounded-md border p-3 transition-colors hover:bg-accent/50"
              >
                <span className="font-medium">{q.topic}</span>
                {q.description && (
                  <p className="mt-1 text-muted-foreground text-sm line-clamp-1">
                    {q.description}
                  </p>
                )}
                <p className="mt-1 text-muted-foreground text-xs">
                  {new Date(q.createdAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
