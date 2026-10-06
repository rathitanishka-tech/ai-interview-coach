"use client";

import { useState } from "react";
import styles from "./InterviewerPerspectiveStudio.module.css";
import { InterviewerPerspective, saveInterviewerPerspective } from "@/lib/interview/storage";
import { InterviewConfig, Question } from "@/lib/interview/questions";

interface InterviewerPerspectiveStudioProps {
  sessionId: string;
  question: Question;
  originalAnswer: string;
  evaluationContext: string;
  config: InterviewConfig;
  existingData?: InterviewerPerspective;
  onClose: () => void;
}

export function InterviewerPerspectiveStudio({
  sessionId,
  question,
  originalAnswer,
  evaluationContext,
  config,
  existingData,
  onClose
}: InterviewerPerspectiveStudioProps) {
  const [data, setData] = useState<InterviewerPerspective | undefined>(existingData);
  const [isLoading, setIsLoading] = useState(!existingData);
  const [error, setError] = useState("");

  useState(() => {
    if (!existingData) {
      generatePerspective();
    }
  });

  async function generatePerspective() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/perspective", {
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
        throw new Error(errData.error || "Failed to generate perspective.");
      }

      const result = await response.json();
      setData(result);
      
      saveInterviewerPerspective(sessionId, question.id, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.studioContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>👁️ Interviewer Perspective</h3>
          <button className={styles.btnSecondary} onClick={onClose}>Close</button>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Analyzing what a recruiter might infer from your answer...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.studioContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>👁️ Interviewer Perspective</h3>
          <button className={styles.btnSecondary} onClick={onClose}>Close</button>
        </div>
        <div className={styles.errorState}>
          <p><strong>Error:</strong> {error || "Failed to load perspective."}</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={generatePerspective}>Try Again</button>
        </div>
      </div>
    );
  }

  const signalClass = 
    data.hiringSignal === "Strong" ? styles.signalStrong :
    data.hiringSignal === "Mixed" ? styles.signalMixed : 
    styles.signalWeak;

  return (
    <div className={styles.studioContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>👁️ Interviewer Perspective</h3>
        <button className={styles.btnSecondary} onClick={onClose}>Close</button>
      </div>

      <div className={styles.layoutGrid}>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Recruiter Impression</h4>
          <div className={styles.impressionCard}>{data.recruiterImpression}</div>
        </div>
        
        <div className={styles.signalsGrid}>
          <div className={`${styles.signalsBox} ${styles.positive}`}>
            <h4>Positive Signals</h4>
            <ul>
              {data.positiveSignals.length > 0 ? (
                data.positiveSignals.map((s, idx) => <li key={idx}>{s}</li>)
              ) : (
                <li>No strong positive signals identified.</li>
              )}
            </ul>
          </div>
          <div className={`${styles.signalsBox} ${styles.concerns}`}>
            <h4>Potential Concerns</h4>
            <ul>
              {data.potentialConcerns.length > 0 ? (
                data.potentialConcerns.map((s, idx) => <li key={idx}>{s}</li>)
              ) : (
                <li>No major concerns identified.</li>
              )}
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Evidence-Based Hiring Signal</h4>
          <div className={styles.hiringSignalSection}>
            <div className={`${styles.signalBadge} ${signalClass}`}>
              {data.hiringSignal} Signal
            </div>
            <p className={styles.hiringExplanation}>{data.hiringSignalExplanation}</p>
          </div>
        </div>

        <div className={styles.signalsGrid}>
          <div className={styles.signalsBox}>
            <h4>Likely Follow-up Questions</h4>
            <ul>
              {data.likelyFollowUps.length > 0 ? (
                data.likelyFollowUps.map((s, idx) => <li key={idx}>{s}</li>)
              ) : (
                <li>No obvious follow-up questions.</li>
              )}
            </ul>
          </div>
          <div className={styles.signalsBox}>
            <h4>How to Improve the Impression</h4>
            <p>{data.howToImproveImpression}</p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={generatePerspective}>Regenerate</button>
      </div>
    </div>
  );
}
