import { NextResponse } from "next/server";
import { evaluateInterviewAnswer } from "@/lib/ai/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, answer, role, experience, type, difficulty } = body;

    // Validate inputs
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question provided." }, { status: 400 });
    }
    
    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return NextResponse.json({ error: "Answer cannot be empty." }, { status: 400 });
    }

    if (answer.length > 5000) {
      return NextResponse.json({ error: "Answer is too long. Please keep it under 5000 characters." }, { status: 400 });
    }

    if (!role || !experience || !type || !difficulty) {
      return NextResponse.json({ error: "Missing interview configuration details." }, { status: 400 });
    }

    // Call Gemini for evaluation
    const evaluation = await evaluateInterviewAnswer(question, answer, role, experience, type, difficulty);
    
    return NextResponse.json(evaluation, { status: 200 });
  } catch (error) {
    console.error("Evaluation API Route Error:", error);
    // Return generic server error without exposing provider trace
    return NextResponse.json({ error: "Failed to evaluate answer. Falling back to rule-based evaluation." }, { status: 500 });
  }
}
