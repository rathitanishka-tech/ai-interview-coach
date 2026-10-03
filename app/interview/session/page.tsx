"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./session.module.css";
import { InterviewConfig, Question, getQuestions, evaluateAnswer } from "@/lib/interview/questions";

interface Answer {
  questionId: string;
  text: string;
  feedback: string;
}

export default function SessionPage() {
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentText, setCurrentText] = useState("");
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

  // Timer effect
  useEffect(() => {
    if (!mounted || isCompleted || !config) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [mounted, isCompleted, startTime, config]);

  // Load existing answer when navigating between questions
  useEffect(() => {
    if (questions.length > 0) {
      const qId = questions[currentIndex].id;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentText(answers[qId]?.text || "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("");
    }
  }, [currentIndex, questions, answers]);

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

  const handleNext = () => {
    if (!currentText.trim()) {
      setError("Please provide an answer before continuing.");
      return;
    }

    const currentQuestion = questions[currentIndex];
    const feedback = evaluateAnswer(currentText);

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        text: currentText,
        feedback
      }
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Save current progress without validating empty
      if (currentText.trim()) {
        const currentQuestion = questions[currentIndex];
        const feedback = evaluateAnswer(currentText);
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: {
            questionId: currentQuestion.id,
            text: currentText,
            feedback
          }
        }));
      }
      setCurrentIndex(prev => prev - 1);
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
                <span className={styles.statValue}>{Object.keys(answers).length} / {questions.length}</span>
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
                if (!ans) return null;
                return (
                  <div key={q.id} className={styles.answerItem}>
                    <div className={styles.answerQ}>Q{i + 1}: {q.text}</div>
                    <div className={styles.answerA}>{ans.text}</div>
                    <div className={styles.answerFeedback}>
                      <strong>Feedback:</strong> {ans.feedback}
                    </div>
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
                setCurrentText(e.target.value);
                if (error) setError("");
              }}
              aria-label="Your answer"
            />
            
            <div className={styles.answerMeta}>
              <span className={styles.errorText}>{error}</span>
              <span>{currentText.length} characters</span>
            </div>

            {/* If an answer was already submitted and we navigated back, show the feedback */}
            {answers[currentQuestion.id] && currentText === answers[currentQuestion.id].text && (
              <div className={styles.feedback}>
                <strong>Previous Feedback:</strong> {answers[currentQuestion.id].feedback}
              </div>
            )}
          </div>

          <div className={styles.controls}>
            <div>
              {currentIndex > 0 ? (
                <button className={styles.btnSecondary} onClick={handlePrevious}>
                  Previous
                </button>
              ) : (
                <button className={styles.btnSecondary} onClick={handleEndEarly}>
                  End Early
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '1rem', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                {currentIndex + 1} of {questions.length}
              </span>
              <button className={styles.btnPrimary} onClick={handleNext}>
                {currentIndex === questions.length - 1 ? "Finish Interview" : "Submit Answer"}
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
