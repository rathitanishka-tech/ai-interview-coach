import { GoogleGenAI, Type } from "@google/genai";

// Ensure this file is only executed on the server
if (typeof window !== "undefined") {
  throw new Error("This module must only be imported on the server.");
}

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

// Reusable server utility
export async function generateInterviewResponse(prompt: string, systemInstruction?: string) {
  try {
    const ai = getGeminiClient();
    
    // We use gemini-3.8-flash as the default, configurable via environment
    const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error instanceof Error ? error.message : "Unknown error");
    // Return a safe error message without leaking sensitive provider details
    throw new Error("Failed to communicate with AI provider.");
  }
}

export interface EvaluationResult {
  score: number;
  technicalAccuracy: number;
  relevance: number;
  completeness: number;
  communication: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
  idealAnswer: string;
}

export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  role: string,
  experience: string,
  type: string,
  difficulty: string
): Promise<EvaluationResult> {
  try {
    const ai = getGeminiClient();
    // We use gemini-3.8-flash as the default, configurable via environment
    const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const systemInstruction = `You are an expert technical interviewer and career coach.
Evaluate the candidate's answer based on technical accuracy, relevance to the question, completeness, clarity and communication, and practical understanding.
Context:
- Target Role: ${role}
- Experience Level: ${experience}
- Interview Type: ${type}
- Difficulty: ${difficulty}

You must return ONLY a JSON object exactly matching the requested schema. All scores must be integers from 0 to 100.`;

    const prompt = `Question: ${question}\nCandidate Answer: ${answer}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Overall score out of 100" },
            technicalAccuracy: { type: Type.INTEGER, description: "Technical accuracy score out of 100" },
            relevance: { type: Type.INTEGER, description: "Relevance score out of 100" },
            completeness: { type: Type.INTEGER, description: "Completeness score out of 100" },
            communication: { type: Type.INTEGER, description: "Clarity and communication score out of 100" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of strengths" },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of areas for improvement" },
            feedback: { type: Type.STRING, description: "Overall constructive feedback paragraph" },
            idealAnswer: { type: Type.STRING, description: "An example of an ideal answer" }
          },
          required: ["score", "technicalAccuracy", "relevance", "completeness", "communication", "strengths", "improvements", "feedback", "idealAnswer"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const result = JSON.parse(response.text) as EvaluationResult;
    return result;
  } catch (error) {
    console.error("Gemini Evaluation Error:", error instanceof Error ? error.message : "Unknown error");
    throw new Error("Failed to evaluate answer using AI.");
  }
}
