import { NextRequest, NextResponse } from "next/server";
import { QuizService } from "@/services";
import type { SubmitQuizResponse, ApiError } from "@/types/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    const body = await req.json();
    const answers = body?.answers;
    if (!answers || typeof answers !== "object") {
      return NextResponse.json<ApiError>(
        { error: "Bad Request", message: "answers is required", statusCode: 400 },
        { status: 400 }
      );
    }

    const quizService = new QuizService();
    const result = await quizService.submitQuiz(quizId, answers as Record<string, string[]>);

    const response: SubmitQuizResponse = {
      result: {
        quizId: result.quizId,
        score: result.score,
        totalQuestions: result.totalQuestions,
        maxScore: result.maxScore,
        questionResults: result.questionResults,
        questions: result.questions,
      },
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Quiz submit error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json<ApiError>(
      { error: "Internal Server Error", message, statusCode: 500 },
      { status: 500 }
    );
  }
}
