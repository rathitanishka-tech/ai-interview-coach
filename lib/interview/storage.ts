import { InterviewConfig, Question } from "./questions";

export interface CoachingAnalysis {
  improvedAnswer: string;
  whatWasMissing: string;
  whyItIsStronger: string;
  suggestedStructure: string;
  starGuidance: string | null;
  practiceTip: string;
}

export interface AnswerState {
  questionId: string;
  text: string;
  evaluationStatus: 'none' | 'loading' | 'evaluated' | 'fallback';
  feedback?: string;
  aiError?: string;
  evaluation?: {
    score: number;
    technicalAccuracy: number;
    relevance: number;
    completeness: number;
    communication: number;
    strengths: string[];
    improvements: string[];
    idealAnswer: string;
  };
  improvementData?: CoachingAnalysis;
}

export interface InterviewHistoryRecord {
  id: string;
  timestamp: number;
  config: InterviewConfig;
  questions: Question[];
  answers: Record<string, AnswerState>;
  overallScore: number;
  totalTimeSeconds: number;
}

const STORAGE_KEY = "ai_interview_coach_history";

export function getInterviewHistory(): InterviewHistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load interview history:", error);
    return [];
  }
}

export function saveInterviewRecord(record: InterviewHistoryRecord): void {
  if (typeof window === "undefined") return;
  try {
    const history = getInterviewHistory();
    // Prevent duplicate records (if the completion action runs more than once for the same ID)
    const existingIndex = history.findIndex(r => r.id === record.id);
    if (existingIndex >= 0) {
      history[existingIndex] = record;
    } else {
      history.push(record);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save interview record:", error);
  }
}

export function saveAnswerImprovement(sessionId: string, questionId: string, improvementData: CoachingAnalysis): void {
  if (typeof window === "undefined") return;
  try {
    const history = getInterviewHistory();
    const recordIndex = history.findIndex(r => r.id === sessionId);
    if (recordIndex >= 0) {
      const record = history[recordIndex];
      if (record.answers[questionId]) {
        record.answers[questionId].improvementData = improvementData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
    }
  } catch (error) {
    console.error("Failed to save answer improvement:", error);
  }
}
