import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { config } from "@/config/env";
import type { Question, QuestionOption } from "@/types/quiz";
import { OPTION_LABELS, generatedQuizSchema, type GeneratedQuiz } from "./schemas";

export type GenerateQuizOptions = {
  modelId?: string;
  apiKey?: string;
  maxRetries?: number;
};

export type GenerateQuizResult = {
  questions: Question[];
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
};

const DEFAULT_MODEL = "gpt-4o";

const SYSTEM_PROMPT = `You are a quiz generator. Create exactly 5 multiple-choice questions on the given topic.
- Each question must have exactly 4 options labeled A, B, C, D (in order).
- Exactly one option per question must be correct (isCorrect: true).
- Questions should be clear, factual, and appropriately difficult.
- Option text should be concise. Always include a brief explanation for the correct answer (use empty string if the question is self-evident).`;

function toQuestions(generated: GeneratedQuiz): Question[] {
  const questions: Question[] = [];
  for (let i = 0; i < generated.questions.length; i++) {
    const q = generated.questions[i];
    const qId = crypto.randomUUID();
    const options: QuestionOption[] =
      q?.options?.map((opt, j) => ({
        id: crypto.randomUUID(),
        optionText: opt?.text ?? "",
        optionLabel: OPTION_LABELS[j],
        isCorrect: opt?.isCorrect ?? false,
        order: j + 1,
      })) ?? [];
    questions.push({
      id: qId,
      questionText: q?.questionText ?? "",
      explanation: q?.explanation ?? "",
      order: i + 1,
      options,
    });
  }
  return questions;
}

export class AIService {
  private readonly model;
  private readonly maxRetries: number;

  constructor(options: GenerateQuizOptions = {}) {
    const apiKey = options.apiKey ?? config.openai.apiKey;
    const modelId = options.modelId ?? DEFAULT_MODEL;
    const openai = createOpenAI({ apiKey });
    this.model = openai.responses(modelId);
    this.maxRetries = options.maxRetries ?? 2;
  }

  async generateQuiz(topic: string): Promise<GenerateQuizResult> {
    const { object, usage } = await generateObject({
      model: this.model,
      schema: generatedQuizSchema,
      schemaName: "GeneratedQuiz",
      schemaDescription:
        "A quiz with 5 multiple-choice questions, each with 4 options (A-D) and one correct answer.",
      system: SYSTEM_PROMPT,
      prompt: `Generate a quiz on this topic: ${topic}`,
      maxRetries: this.maxRetries,
    });

    const questions = toQuestions(object as GeneratedQuiz);
    const u = usage as
      | {
          promptTokens?: number;
          completionTokens?: number;
          inputTokens?: number;
          outputTokens?: number;
          totalTokens?: number;
        }
      | undefined;
    return {
      questions,
      usage: u
        ? {
            promptTokens: u.promptTokens ?? u.inputTokens,
            completionTokens: u.completionTokens ?? u.outputTokens,
            totalTokens: u.totalTokens,
          }
        : undefined,
    };
  }
}
