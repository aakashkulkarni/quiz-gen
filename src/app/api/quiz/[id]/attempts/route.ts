import { NextResponse } from "next/server";
import { QuizService } from "@/services";
import type { ApiError } from "@/types/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    const quizService = new QuizService();
    const attempts = await quizService.getAttemptsForQuiz(quizId);
    return NextResponse.json({ attempts });
  } catch (err) {
    console.error("List attempts error:", err);
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
