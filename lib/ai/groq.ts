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
  followUpQuestion?: string | null;
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

Adaptive Follow-up Strategy:
- Strong answer (80-100): Ask a deeper, more challenging follow-up question exploring trade-offs, edge cases, optimization, or real-world implementation.
- Moderate answer (60-79): Ask a practical application or clarification question to test whether the candidate understands how to apply the concept.
- Weak answer (0-59): Ask a simpler conceptual question to help identify missing fundamental knowledge.
- Irrelevant/Invalid answer: Ask a gentle redirecting question related to the original topic. Do not reward irrelevant answers with artificially high scores.
- Do not repeat the original question. Keep the follow-up concise.

You must return ONLY a JSON object containing EXACTLY these keys:
- score (integer 0-100)
- technicalAccuracy (integer 0-100)
- relevance (integer 0-100)
- completeness (integer 0-100)
- communication (integer 0-100)
- strengths (array of strings)
- improvements (array of strings)
- feedback (string paragraph)
- idealAnswer (string)
- followUpQuestion (string or null)`;

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

export interface CoachingAnalysis {
  improvedAnswer: string;
  whatWasMissing: string;
  whyItIsStronger: string;
  suggestedStructure: string;
  starGuidance: string | null;
  practiceTip: string;
}

export async function improveInterviewAnswerGroq(
  question: string,
  originalAnswer: string,
  evaluationContext: string,
  role: string,
  experience: string,
  difficulty: string
): Promise<CoachingAnalysis> {
  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const ai = getGroqClient();
      const modelName = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

      const systemInstruction = `You are an expert technical interviewer and career coach.
The user wants to improve their specific interview answer.
Context:
- Target Role: ${role}
- Experience Level: ${experience}
- Difficulty: ${difficulty}

Task:
1. Provide a polished, professional improved answer. IT MUST NOT invent fictitious metrics, projects, skills, or companies. It must strictly preserve the user's actual intent and experience. If the user's answer is extremely brief, expand it naturally without making up hard facts.
2. Clearly identify what was missing from the original answer.
3. Explain why the improved answer is stronger.
4. Provide a suggested structure for this type of question.
5. If this is a behavioral question, provide STAR method guidance (Situation, Task, Action, Result). Otherwise, return null for starGuidance.
6. Provide a concise practice tip to help them remember this structure.

You must return ONLY a JSON object containing EXACTLY these keys:
- improvedAnswer (string)
- whatWasMissing (string)
- whyItIsStronger (string)
- suggestedStructure (string)
- starGuidance (string or null)
- practiceTip (string)`;

      const prompt = `Question: ${question}\nOriginal Answer: ${originalAnswer}\nAI Feedback Context:\n${evaluationContext}`;

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

      return JSON.parse(content) as CoachingAnalysis;
    } catch (error) {
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        
        const isRateLimit = msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests");
        const isUnavailable = msg.includes("503") || msg.includes("unavailable") || msg.includes("500");
        
        if ((isRateLimit || isUnavailable) && attempt < maxRetries) {
          console.warn(`Groq Improvement failed (Attempt ${attempt + 1}/${maxRetries + 1}). Retrying...`, error.message);
          const jitter = Math.random() * 500;
          const delay = (baseDelay * Math.pow(2, attempt)) + jitter;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }

        console.error("Groq Improvement Final Error:", error.message);
        
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
      
      console.error("Groq Improvement Unknown Error:", error);
      throw new Error("UNKNOWN_ERROR");
    }
  }
  
  throw new Error("UNKNOWN_ERROR");
}
