"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AnswerImprovementStudio.module.css";
import { CoachingAnalysis, saveAnswerImprovement } from "@/lib/interview/storage";
import { InterviewConfig, Question } from "@/lib/interview/questions";

interface AnswerImprovementStudioProps {
  sessionId: string;
  question: Question;
  originalAnswer: string;
  evaluationContext: string;
  config: InterviewConfig;
  existingData?: CoachingAnalysis;
  onClose: () => void;
}

export function AnswerImprovementStudio({
  sessionId,
  question,
  originalAnswer,
  evaluationContext,
  config,
  existingData,
  onClose
}: AnswerImprovementStudioProps) {
  const router = useRouter();
  const [data, setData] = useState<CoachingAnalysis | undefined>(existingData);
  const [isLoading, setIsLoading] = useState(!existingData);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch improvement if none exists
  useState(() => {
    if (!existingData) {
      generateImprovement();
    }
  });

  async function generateImprovement() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.text,
          originalAnswer,
          evaluationContext,
          role: config.role,
          experience: config.experience,
          difficulty: config.difficulty
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate improvement.");
      }

      const result = await response.json();
      setData(result);
      
      // Save it to history to avoid re-fetching
      saveAnswerImprovement(sessionId, question.id, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    if (data?.improvedAnswer) {
      navigator.clipboard.writeText(data.improvedAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePracticeAgain = () => {
    // Hijack session storage exactly like Phase 10B.3 Smart Next Practice
    sessionStorage.setItem("interviewConfig", JSON.stringify({
      role: config.role,
      experience: config.experience,
      type: config.type,
      difficulty: config.difficulty,
      questions: 1
    }));
    sessionStorage.setItem("practiceQuestion", JSON.stringify(question));
    // We intentionally DO NOT set practiceTaskId, so it acts purely as a 1-off practice
    router.push("/interview/session?mode=practice");
  };

  if (isLoading) {
    return (
      <div className={styles.studioContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>✨ AI Answer Improvement Studio</h3>
          <button className={styles.btnSecondary} onClick={onClose}>Close</button>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Analyzing your intent and crafting a stronger response...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.studioContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>✨ AI Answer Improvement Studio</h3>
          <button className={styles.btnSecondary} onClick={onClose}>Close</button>
        </div>
        <div className={styles.errorState}>
          <p><strong>Error:</strong> {error || "Failed to load improvement."}</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={generateImprovement}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.studioContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>✨ AI Answer Improvement Studio</h3>
        <button className={styles.btnSecondary} onClick={onClose}>Close</button>
      </div>

      <div className={styles.layoutGrid}>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Your Original Answer</h4>
          <div className={styles.originalAnswer}>{originalAnswer}</div>
        </div>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Improved Answer</h4>
          <div className={styles.improvedAnswer}>
            {data.improvedAnswer}
            <button className={styles.copyButton} onClick={handleCopy} aria-label="Copy improved answer">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.coachingGrid}>
        <div className={styles.coachingBox}>
          <h4>Why It&apos;s Stronger</h4>
          <p>{data.whyItIsStronger}</p>
        </div>
        <div className={styles.coachingBox}>
          <h4>What Was Missing</h4>
          <p>{data.whatWasMissing}</p>
        </div>
        <div className={styles.coachingBox}>
          <h4>Suggested Structure</h4>
          <p>{data.suggestedStructure}</p>
        </div>
        {data.starGuidance && (
          <div className={styles.coachingBox}>
            <h4>STAR Method</h4>
            <p>{data.starGuidance}</p>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={generateImprovement}>Regenerate</button>
        <button className={styles.btnPrimary} onClick={handlePracticeAgain}>Practice This Question Again</button>
      </div>
    </div>
  );
}
