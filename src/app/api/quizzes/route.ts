import { NextResponse } from "next/server";
import { QuizService } from "@/services";
import type { ApiError } from "@/types/api";

export async function GET() {
  try {
    const quizService = new QuizService();
    const quizzes = await quizService.listQuizzes();
    return NextResponse.json({ quizzes });
  } catch (err) {
    console.error("List quizzes error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json<ApiError>(
      {
        error: "Internal Server Error",
        message,
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
