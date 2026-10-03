"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./history.module.css";
import { getInterviewHistory, InterviewHistoryRecord } from "@/lib/interview/storage";

export default function HistoryPage() {
  const [history, setHistory] = useState<InterviewHistoryRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setHistory(getInterviewHistory().sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  if (!mounted) return null;

  const totalInterviews = history.length;
  const totalQuestions = history.reduce((acc, curr) => {
    return acc + Object.keys(curr.answers).filter(k => curr.answers[k].text.trim()).length;
  }, 0);
  const averageScore = totalInterviews > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.overallScore, 0) / totalInterviews)
    : 0;

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <Link href="/" className={styles.brand}>AI Interview Coach</Link>
        <nav className={styles.navLinks}>
          <Link href="/interview/setup" className={styles.navLink}>New Interview</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Performance Analytics</h1>
          <p className={styles.subtitle}>Track your progress and review past feedback</p>
        </div>

        {totalInterviews === 0 ? (
          <div className={styles.emptyState}>
            <h2>No interviews yet</h2>
            <p>Complete your first mock interview to see your analytics here.</p>
            <Link href="/interview/setup" className={styles.btnPrimary}>Start Practicing</Link>
          </div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{totalInterviews}</span>
                <span className={styles.statLabel}>Total Interviews</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{averageScore}</span>
                <span className={styles.statLabel}>Avg Score</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{totalQuestions}</span>
                <span className={styles.statLabel}>Questions Answered</span>
              </div>
            </div>

            <div className={styles.historyList}>
              {history.map((record) => {
                const date = new Date(record.timestamp).toLocaleDateString(undefined, { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                });
                const isExpanded = expandedId === record.id;

                return (
                  <div key={record.id} className={styles.historyCard}>
                    <div 
                      className={styles.cardHeader} 
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    >
                      <div className={styles.cardMeta}>
                        <h3>{record.config.role} ({record.config.difficulty})</h3>
                        <p>{date} • {record.config.type} Interview • {Math.floor(record.totalTimeSeconds / 60)}m {record.totalTimeSeconds % 60}s</p>
                      </div>
                      <div className={styles.cardScore}>
                        <div className={styles.scoreValue}>{record.overallScore}</div>
                        <div className={styles.scoreLabel}>Score</div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={styles.cardBody}>
                        {record.questions.map((q, i) => {
                          const ans = record.answers[q.id];
                          if (!ans || !ans.text.trim()) return null;

                          return (
                            <div key={q.id} className={styles.questionItem}>
                              <div className={styles.qText}>Q{i + 1}: {q.text}</div>
                              <div className={styles.aText}>{ans.text}</div>

                              {ans.evaluationStatus === 'evaluated' && ans.evaluation ? (
                                <div>
                                  <div className={styles.evalScore}>
                                    Score: {ans.evaluation.score}/100
                                  </div>
                                  <div className={styles.aiFeedback}>{ans.feedback}</div>
                                  
                                  <div className={styles.evalGrid} style={{ marginTop: '1.5rem' }}>
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
                                </div>
                              ) : (
                                <div className={styles.aiFeedback}>
                                  <strong>Rule-based Feedback:</strong> {ans.feedback || "No feedback available."}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
