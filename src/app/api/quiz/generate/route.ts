import { NextRequest, NextResponse } from "next/server";
import { QuizService } from "@/services";
import type { GenerateQuizResponse, ApiError } from "@/types/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = body?.topic;
    if (typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json<ApiError>(
        { error: "Bad Request", message: "topic is required", statusCode: 400 },
        { status: 400 }
      );
    }
    const description = typeof body?.description === "string" ? body.description : undefined;

    const quizService = new QuizService();
    const { quiz } = await quizService.generateQuiz(topic.trim(), description);

    const response: GenerateQuizResponse = {
      quiz: {
        id: quiz.id,
        topic: quiz.topic,
        description: quiz.description,
        questions: quiz.questions,
        createdAt: quiz.createdAt.toISOString(),
        updatedAt: quiz.updatedAt.toISOString(),
      },
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Quiz generate error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json<ApiError>(
      { error: "Internal Server Error", message, statusCode: 500 },
      { status: 500 }
    );
  }
}
