import { NextResponse } from "next/server";
import { QuizService } from "@/services";
import type { ApiError } from "@/types/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { id: quizId, attemptId } = await params;
    const quizService = new QuizService();
    const attempt = await quizService.getAttemptById(quizId, attemptId);
    if (!attempt) {
      return NextResponse.json(
        { error: "Not Found", message: "Attempt not found", statusCode: 404 },
        { status: 404 }
      );
    }
    return NextResponse.json({ result: attempt });
  } catch (err) {
    console.error("Get attempt error:", err);
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
