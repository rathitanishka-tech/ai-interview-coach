import Groq from "groq-sdk";

// Ensure this file is only executed on the server
if (typeof window !== "undefined") {
  throw new Error("This module must only be imported on the server.");
}

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in the environment.");
  }
  return new Groq({ apiKey });
};

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

export async function evaluateInterviewAnswerGroq(
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
      const ai = getGroqClient();
      const modelName = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

      const systemInstruction = `You are an expert technical interviewer and career coach.
Evaluate the candidate's answer based on technical accuracy, relevance to the question, completeness, clarity and communication, and practical understanding.
Context:
- Target Role: ${role}
- Experience Level: ${experience}
- Interview Type: ${type}
- Difficulty: ${difficulty}

You must return ONLY a JSON object containing EXACTLY these keys:
- score (integer 0-100)
- technicalAccuracy (integer 0-100)
- relevance (integer 0-100)
- completeness (integer 0-100)
- communication (integer 0-100)
- strengths (array of strings)
- improvements (array of strings)
- feedback (string paragraph)
- idealAnswer (string)`;

      const prompt = `Question: ${question}\nCandidate Answer: ${answer}`;

      const response = await ai.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("UNKNOWN_ERROR: No response text from Groq");
      }

      return JSON.parse(content) as EvaluationResult;
    } catch (error) {
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        
        // Determine if error is retryable
        const isRateLimit = msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests");
        const isUnavailable = msg.includes("503") || msg.includes("unavailable") || msg.includes("500");
        
        if ((isRateLimit || isUnavailable) && attempt < maxRetries) {
          console.warn(`Groq evaluation failed (Attempt ${attempt + 1}/${maxRetries + 1}). Retrying...`, error.message);
          // Exponential backoff with jitter
          const jitter = Math.random() * 500;
          const delay = (baseDelay * Math.pow(2, attempt)) + jitter;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }

        // Exhausted retries or non-retryable error
        console.error("Groq Evaluation Final Error:", error.message);
        
        if (msg.includes("groq_api_key is not configured") || msg.includes("invalid api key") || msg.includes("401")) {
          throw new Error("INVALID_API_KEY");
        }
        if (isRateLimit) {
          throw new Error("RATE_LIMITED");
        }
        if (msg.includes("quota") || msg.includes("insufficient_quota")) {
          throw new Error("QUOTA_EXHAUSTED");
        }
        if (isUnavailable) {
          throw new Error("SERVICE_UNAVAILABLE");
        }
        if (msg.includes("does not exist") || msg.includes("model_not_found") || msg.includes("404")) {
          throw new Error("MODEL_UNAVAILABLE");
        }
      }
      
      console.error("Groq Evaluation Unknown Error:", error);
      throw new Error("UNKNOWN_ERROR");
    }
  }
  
  throw new Error("UNKNOWN_ERROR");
}
