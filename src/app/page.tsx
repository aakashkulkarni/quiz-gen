import { GenerateQuizForm } from "@/components/generate-quiz-form";

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">AI-Powered Knowledge Quiz Builder</h1>
        <p className="mt-3 text-muted-foreground">
          Enter a topic and we&apos;ll generate a 5-question quiz for you.
        </p>
      </div>
      <GenerateQuizForm />
    </div>
  );
}
