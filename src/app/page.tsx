import { Suspense } from "react";
import { GenerateQuizForm } from "@/components/generate-quiz-form";
import { PastQuizzesList } from "@/components/past-quizzes-list";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Quiz Gen: AI-Powered Quiz Builder</h1>
        <p className="mt-3 text-muted-foreground">
          Enter a topic and we&apos;ll generate a 5-question quiz for you.
        </p>
      </div>
      <div className="space-y-8">
        <GenerateQuizForm />
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Past quizzes</CardTitle>
                <CardDescription>Loading…</CardDescription>
              </CardHeader>
            </Card>
          }
        >
          <PastQuizzesList />
        </Suspense>
      </div>
    </div>
  );
}
