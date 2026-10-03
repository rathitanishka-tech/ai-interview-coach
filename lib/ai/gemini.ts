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
  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const ai = getGeminiClient();
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
        throw new Error("UNKNOWN_ERROR: No response text from Gemini");
      }

      return JSON.parse(response.text) as EvaluationResult;
    } catch (error) {
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        
        // Determine if error is retryable
        const isRateLimit = msg.includes("429") || msg.includes("quota") || msg.includes("resource_exhausted");
        const isUnavailable = msg.includes("503") || msg.includes("demand") || msg.includes("unavailable");
        
        if ((isRateLimit || isUnavailable) && attempt < maxRetries) {
          console.warn(`Gemini evaluation failed (Attempt ${attempt + 1}/${maxRetries + 1}). Retrying...`, error.message);
          // Exponential backoff with jitter
          const jitter = Math.random() * 500;
          const delay = (baseDelay * Math.pow(2, attempt)) + jitter;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }

        // Exhausted retries or non-retryable error
        console.error("Gemini Evaluation Final Error:", error.message);
        
        if (msg.includes("gemini_api_key is not configured") || msg.includes("invalid_api_key")) {
          throw new Error("INVALID_API_KEY");
        }
        if (isRateLimit) {
          throw new Error("RATE_LIMITED");
        }
        if (isUnavailable) {
          throw new Error("SERVICE_UNAVAILABLE");
        }
        if (msg.includes("not_found") || msg.includes("404")) {
          throw new Error("MODEL_UNAVAILABLE");
        }
      }
      
      console.error("Gemini Evaluation Unknown Error:", error);
      throw new Error("UNKNOWN_ERROR");
    }
  }
  
  throw new Error("UNKNOWN_ERROR");
}
