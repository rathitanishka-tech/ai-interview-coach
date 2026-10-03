"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./session.module.css";
import { InterviewConfig, Question, getQuestions, evaluateAnswer } from "@/lib/interview/questions";

interface AnswerState {
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
}

export default function SessionPage() {
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Store everything perfectly per question ID
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  
  const [mounted, setMounted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const saved = sessionStorage.getItem("interviewConfig");
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        setQuestions(getQuestions(parsed));
        setStartTime(Date.now());
      }
    } catch (e) {
      console.warn("Could not read sessionStorage", e);
    }
  }, []);

  useEffect(() => {
    if (!mounted || isCompleted || !config) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted, isCompleted, startTime, config]);

  if (!mounted) return null;

  if (!config) {
    return (
      <div className={styles.container}>
        <div className={styles.completionCard}>
          <p>No configuration found. Please start from the setup page.</p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/interview/setup" className={styles.btnPrimary}>Go to Setup</Link>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const submitAnswer = async (question: Question, text: string) => {
    // Mark as loading
    setAnswers(prev => ({
      ...prev,
      [question.id]: {
        ...(prev[question.id] || { questionId: question.id, text }),
        evaluationStatus: 'loading'
      }
    }));
    setError("");

    try {
      const response = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.text,
          answer: text,
          role: config.role,
          experience: config.experience,
          type: config.type,
          difficulty: config.difficulty
        })
      });

      if (!response.ok) {
        let errData = { error: "Failed to get AI evaluation" };
        try {
          errData = await response.json();
        } catch (_) {} // ignore parsing errors for 500s that aren't JSON
        throw new Error(errData.error || "Failed to get AI evaluation");
      }

      const aiEval = await response.json();
      
      setAnswers(prev => ({
        ...prev,
        [question.id]: {
          ...prev[question.id],
          evaluationStatus: 'evaluated',
          feedback: aiEval.feedback,
          evaluation: aiEval
        }
      }));
    } catch (e) {
      let errorCode = "UNKNOWN_ERROR";
      if (e instanceof Error) {
        errorCode = e.message;
      }
      
      const errorMap: Record<string, string> = {
        "RATE_LIMITED": "Rate Limit Exceeded. Please slow down.",
        "QUOTA_EXHAUSTED": "API Quota Exceeded.",
        "INVALID_API_KEY": "Missing or Invalid API Key.",
        "MODEL_UNAVAILABLE": "Configured AI model is unavailable.",
        "SERVICE_UNAVAILABLE": "Service is currently experiencing high demand.",
        "UNKNOWN_ERROR": "An unknown error occurred."
      };
      
      const displayMsg = errorMap[errorCode] || "Service Unavailable";
      
      console.warn(`Evaluation failed for ${question.id}. Using fallback.`, errorCode);
      const fallbackFeedback = evaluateAnswer(text);
      setAnswers(prev => ({
        ...prev,
        [question.id]: {
          ...prev[question.id],
          evaluationStatus: 'fallback',
          feedback: fallbackFeedback,
          aiError: displayMsg
        }
      }));
    }
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentIndex];
    const currentAnswerState = answers[currentQuestion.id];
    const text = currentAnswerState?.text || "";

    if (!text.trim()) {
      setError("Please provide an answer before continuing.");
      return;
    }

    if (!currentAnswerState || currentAnswerState.evaluationStatus === 'none') {
      await submitAnswer(currentQuestion, text);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setError("");
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      const currentQuestion = questions[currentIndex];
      const currentAnswerState = answers[currentQuestion.id];
      
      // If they typed something but didn't submit, submit it quietly
      if (currentAnswerState && currentAnswerState.text.trim() && currentAnswerState.evaluationStatus === 'none') {
        await submitAnswer(currentQuestion, currentAnswerState.text);
      }
      
      setCurrentIndex(prev => prev - 1);
      setError("");
    }
  };

  const handleEndEarly = () => {
    if (confirm("Are you sure you want to end the interview early? Unsaved answers will be lost.")) {
      setIsCompleted(true);
    }
  };

  if (isCompleted) {
    return (
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div className={styles.brand}>AI Interview Coach</div>
        </header>
        
        <main className={styles.main}>
          <div className={styles.completionCard}>
            <div className={styles.completionIcon}>🎉</div>
            <h1 className={styles.completionTitle}>Interview Completed</h1>
            
            <div className={styles.completionStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{Object.keys(answers).filter(k => answers[k].text.trim()).length} / {questions.length}</span>
                <span className={styles.statLabel}>Questions Answered</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{formatTime(elapsedTime)}</span>
                <span className={styles.statLabel}>Total Time</span>
              </div>
            </div>

            <div className={styles.answersList}>
              {questions.map((q, i) => {
                const ans = answers[q.id];
                if (!ans || !ans.text.trim()) return null;
                return (
                  <div key={q.id} className={styles.answerItem}>
                    <div className={styles.answerQ}>Q{i + 1}: {q.text}</div>
                    <div className={styles.answerA}>{ans.text}</div>
                    
                    {ans.evaluationStatus === 'evaluated' && ans.evaluation ? (
                      <div className={styles.aiEvaluation}>
                        <div className={styles.evalScore}>
                          Score: <strong>{ans.evaluation.score}/100</strong>
                        </div>
                        <p className={styles.evalFeedback}>{ans.feedback}</p>
                        
                        <div className={styles.evalGrid}>
                          <div className={styles.evalBox}>
                            <h4>Strengths</h4>
                            <ul>
                              {ans.evaluation.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          </div>
                          <div className={styles.evalBox}>
                            <h4>Areas to Improve</h4>
                            <ul>
                              {ans.evaluation.improvements.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          </div>
                        </div>

                        <div className={styles.evalIdeal}>
                          <h4>Ideal Answer Structure</h4>
                          <p>{ans.evaluation.idealAnswer}</p>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.answerFeedback}>
                        <strong>Rule-based Feedback:</strong> {ans.feedback || "No feedback available."}
                        <div className={styles.fallbackLabel}>
                          (AI Evaluation Failed: {ans.aiError || "Service Unavailable"})
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Link href="/interview/setup" className={styles.btnPrimary} style={{ display: 'inline-block' }}>
              Practice Again
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const currentAnswerState = answers[currentQuestion.id];
  const currentText = currentAnswerState?.text || "";
  const isSubmitting = currentAnswerState?.evaluationStatus === 'loading';

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <div className={styles.brand}>AI Interview Coach</div>
        <div className={styles.interviewMeta}>
          <span>{config.type} Interview</span>
          <span>•</span>
          <span>{config.role}</span>
          <span>•</span>
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.workspace}>
          
          <div className={styles.questionHeader}>
            <div className={styles.badge}>{currentQuestion.category}</div>
            <h2 className={styles.questionText}>
              <span style={{ color: 'var(--color-primary)', marginRight: '8px' }}>Q{currentIndex + 1}.</span> 
              {currentQuestion.text}
            </h2>
          </div>

          <div className={styles.answerArea}>
            <textarea
              className={`${styles.textarea} ${error ? styles.textareaError : ""}`}
              placeholder="Take your time. Explain your thinking..."
              value={currentText}
              onChange={(e) => {
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: {
                    ...(prev[currentQuestion.id] || { questionId: currentQuestion.id, evaluationStatus: 'none' }),
                    text: e.target.value,
                    // If they edit the text, reset evaluation status so it can be re-evaluated
                    evaluationStatus: 'none'
                  }
                }));
                if (error) setError("");
              }}
              aria-label="Your answer"
              disabled={isSubmitting}
            />
            
            <div className={styles.answerMeta}>
              <span className={styles.errorText}>{error}</span>
              <span>{currentText.length} characters</span>
            </div>
            
            {isSubmitting && (
              <div style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
                Analyzing your answer...
              </div>
            )}

            {/* Show previous feedback if it exists and we're not loading */}
            {currentAnswerState?.feedback && currentAnswerState.evaluationStatus !== 'loading' && currentAnswerState.evaluationStatus !== 'none' && (
              <div className={styles.feedback}>
                <strong>Previous Feedback:</strong> {currentAnswerState.feedback}
              </div>
            )}
          </div>

          <div className={styles.controls}>
            <div>
              {currentIndex > 0 ? (
                <button className={styles.btnSecondary} onClick={handlePrevious} disabled={isSubmitting}>
                  Previous
                </button>
              ) : (
                <button className={styles.btnSecondary} onClick={handleEndEarly} disabled={isSubmitting}>
                  End Early
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '1rem', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                {currentIndex + 1} of {questions.length}
              </span>
              <button className={styles.btnPrimary} onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting ? "Evaluating..." : currentIndex === questions.length - 1 ? "Finish Interview" : "Submit Answer"}
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
