import { NextResponse } from "next/server";
import { improveInterviewAnswerGroq } from "@/lib/ai/groq";
import { z } from "zod";

const improveSchema = z.object({
  question: z.string().min(1, "Invalid question provided."),
  originalAnswer: z.string().min(1, "Answer cannot be empty.").max(5000, "Answer is too long."),
  evaluationContext: z.string(),
  role: z.string().min(1, "Missing role."),
  experience: z.string().min(1, "Missing experience."),
  difficulty: z.string().min(1, "Missing difficulty.")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate inputs
    const parsed = improveSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(e => e.message).join(" ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { question, originalAnswer, evaluationContext, role, experience, difficulty } = parsed.data;

    // Call Groq for improvement
    const improvement = await improveInterviewAnswerGroq(question, originalAnswer, evaluationContext, role, experience, difficulty);
    
    // Zod validation on output (since we must handle malformed AI output safely)
    const outputSchema = z.object({
      improvedAnswer: z.string(),
      whatWasMissing: z.string(),
      whyItIsStronger: z.string(),
      suggestedStructure: z.string(),
      starGuidance: z.string().nullable().optional(),
      practiceTip: z.string()
    });

    const outputParsed = outputSchema.safeParse(improvement);
    if (!outputParsed.success) {
      console.error("Groq Improvement Malformed Output:", outputParsed.error);
      return NextResponse.json({ error: "Malformed AI response." }, { status: 500 });
    }

    return NextResponse.json(outputParsed.data, { status: 200 });
  } catch (error) {
    console.error("Improvement API Route Error:", error instanceof Error ? error.message : "Unknown error");
    
    let errorCode = "UNKNOWN_ERROR";
    if (error instanceof Error) {
      if (["RATE_LIMITED", "QUOTA_EXHAUSTED", "INVALID_API_KEY", "MODEL_UNAVAILABLE", "SERVICE_UNAVAILABLE", "UNKNOWN_ERROR"].includes(error.message)) {
        errorCode = error.message;
      }
    }
    
    return NextResponse.json({ error: errorCode }, { status: 500 });
  }
}
