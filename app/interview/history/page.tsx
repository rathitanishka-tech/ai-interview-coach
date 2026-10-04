"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./history.module.css";
import { getInterviewHistory, InterviewHistoryRecord } from "@/lib/interview/storage";
import { getAnalyticsData, WEAKNESS_THRESHOLD } from "@/lib/interview/analytics";
import { ReadinessGauge } from "@/components/ReadinessGauge";
import { AnswerImprovementStudio } from "@/components/AnswerImprovementStudio";

export default function HistoryPage() {
  const [history, setHistory] = useState<InterviewHistoryRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [improvingAnswers, setImprovingAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setHistory(getInterviewHistory().sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  if (!mounted) return null;

  const analytics = getAnalyticsData(history);
  const { 
    totalInterviews, 
    totalQuestions, 
    averageScore, 
    evalCount, 
    avgTech, 
    avgRel, 
    avgComp, 
    avgComm, 
    trendData, 
    weaknesses 
  } = analytics;

  const getTrendClass = (type: string) => {
    switch (type) {
      case 'improving': return styles.trendImproving;
      case 'declining': return styles.trendDeclining;
      case 'stable': return styles.trendStable;
      default: return styles.trendInsufficient;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <Link href="/" className={styles.brand}>AI Interview Coach</Link>
        <nav className={styles.navLinks}>
          <Link href="/interview/setup" className={styles.navLink}>New Interview</Link>
          <Link href="/practice" className={styles.navLink}>Practice Plan</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Career Growth Engine</h1>
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
            <div className={styles.disclaimer}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span><strong>Note:</strong> These scores are AI-generated estimates to guide your preparation and refine your communication, not objective certifications.</span>
            </div>

            <ReadinessGauge readiness={analytics.readiness} />

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

            {/* AI Career Growth Analytics Section */}
            <div className={styles.analyticsSection}>
              <h2 className={styles.sectionTitle}>Skill Analytics</h2>
              
              {evalCount === 0 ? (
                <div className={styles.emptyState} style={{ padding: '3rem 2rem' }}>
                  <h2>Insufficient Data</h2>
                  <p>We need at least one AI-evaluated answer to generate your skill breakdown.</p>
                </div>
              ) : (
                <div className={styles.analyticsGrid}>
                  
                  {/* Skill Breakdown Chart */}
                  <div className={styles.chartCard}>
                    <h3>Skill Breakdown <span style={{fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 'normal'}}>(Based on {evalCount} answers)</span></h3>
                    
                    <div className={styles.skillBar}>
                      <div className={styles.skillHeader}>
                        <span>Technical Accuracy</span>
                        <span>{avgTech}/100</span>
                      </div>
                      <div className={styles.skillTrack}>
                        <div className={styles.skillFill} style={{ width: `${avgTech}%` }}></div>
                      </div>
                    </div>

                    <div className={styles.skillBar}>
                      <div className={styles.skillHeader}>
                        <span>Relevance</span>
                        <span>{avgRel}/100</span>
                      </div>
                      <div className={styles.skillTrack}>
                        <div className={styles.skillFill} style={{ width: `${avgRel}%` }}></div>
                      </div>
                    </div>

                    <div className={styles.skillBar}>
                      <div className={styles.skillHeader}>
                        <span>Completeness</span>
                        <span>{avgComp}/100</span>
                      </div>
                      <div className={styles.skillTrack}>
                        <div className={styles.skillFill} style={{ width: `${avgComp}%` }}></div>
                      </div>
                    </div>

                    <div className={styles.skillBar}>
                      <div className={styles.skillHeader}>
                        <span>Communication</span>
                        <span>{avgComm}/100</span>
                      </div>
                      <div className={styles.skillTrack}>
                        <div className={styles.skillFill} style={{ width: `${avgComm}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Trend Chart */}
                  <div className={styles.chartCard}>
                    <h3>Score Trend over Time</h3>
                    <div className={styles.trendContainer}>
                      {trendData.map((record) => {
                        const dateLabel = new Date(record.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        return (
                          <div key={record.id} className={styles.trendBarWrapper}>
                            <div className={styles.trendScoreLabel}>{record.overallScore}</div>
                            <div 
                              className={styles.trendBar} 
                              style={{ height: `${Math.max(record.overallScore, 5)}%` }}
                              title={`${dateLabel}: ${record.overallScore}/100`}
                            ></div>
                            <div className={styles.trendLabel}>{dateLabel}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                </div>
              )}
            </div>

            {/* Phase 10B.2: Answer Pattern Detection Section */}
            <div className={styles.analyticsSection}>
              <h2 className={styles.sectionTitle}>Recurring Patterns</h2>
              
              {analytics.patternsStatus === 'Insufficient Data' ? (
                <div className={styles.emptyState} style={{ padding: '3rem 2rem' }}>
                  <h2>Keep Practicing</h2>
                  <p>Complete at least 5 evaluated questions to unlock deterministic pattern detection based on your AI feedback.</p>
                </div>
              ) : analytics.patternsStatus === 'No Patterns Detected' ? (
                <div className={styles.emptyState} style={{ padding: '3rem 2rem', borderLeft: '4px solid #4CAF50' }}>
                  <h2>Great Form!</h2>
                  <p>We haven&apos;t detected any recurring anti-patterns or structural weaknesses in your recent answers.</p>
                </div>
              ) : (
                <div className={styles.patternsGrid}>
                  {analytics.patterns.map((p) => {
                    let severityClass = styles.patternSeverityMedium;
                    if (p.severity === 'high') severityClass = styles.patternSeverityHigh;
                    else if (p.severity === 'low') severityClass = styles.patternSeverityLow;

                    return (
                      <div key={p.id} className={styles.patternCard}>
                        <div className={styles.patternHeader}>
                          <h3 className={styles.patternTitle}>{p.title}</h3>
                          <div className={styles.patternFrequency}>{p.frequency} instances</div>
                        </div>
                        <p className={styles.patternDesc}>{p.description}</p>
                        <div className={severityClass}>Severity: {p.severity}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Weakness Detection Section */}
            <div className={styles.analyticsSection}>
              <h2 className={styles.sectionTitle}>Targeted Improvements</h2>
              
              {totalInterviews < 2 || evalCount < 5 ? (
                <div className={styles.emptyState} style={{ padding: '3rem 2rem' }}>
                  <h2>Keep Practicing</h2>
                  <p>Complete at least 2 interviews and answer 5 questions to unlock recurring weakness detection and personalized recommendations.</p>
                </div>
              ) : weaknesses.length === 0 ? (
                <div className={styles.emptyState} style={{ padding: '3rem 2rem', borderLeft: '4px solid #4CAF50' }}>
                  <h2>Excellent Performance!</h2>
                  <p>Your average scores are strong across all dimensions. Keep up the great work and try a harder difficulty level.</p>
                </div>
              ) : (
                <div className={styles.weaknessGrid}>
                  {weaknesses.map((w, i) => (
                    <div key={w.key} className={styles.weaknessCard}>
                      <div className={styles.weaknessHeader}>
                        <div>
                          <h3 className={styles.weaknessTitle}>Priority {i + 1}: {w.label}</h3>
                          <div className={styles.weaknessScore}>Overall Average: <strong>{w.avg}/100</strong></div>
                        </div>
                        <div className={`${styles.trendBadge} ${getTrendClass(w.trendType)}`}>
                          {w.trendStatus}
                        </div>
                      </div>
                      <p className={styles.weaknessReason}>
                        You have consistently scored below our target benchmark of {WEAKNESS_THRESHOLD} in {w.label}. 
                        This pattern was detected across {evalCount} AI-evaluated answers.
                      </p>
                      <div className={styles.recommendationBox}>
                        <div className={styles.recommendationTitle}>Actionable Recommendation</div>
                        <div className={styles.recommendationText}>{w.recommendation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h2 className={styles.sectionTitle}>Interview History</h2>
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
                                        {ans.evaluation.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                                      </ul>
                                    </div>
                                    <div className={styles.evalBox}>
                                      <h4>Areas to Improve</h4>
                                      <ul>
                                        {ans.evaluation.improvements?.map((s, idx) => <li key={idx}>{s}</li>)}
                                      </ul>
                                    </div>
                                  </div>
                                  
                                  {!improvingAnswers[q.id] && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                      <button 
                                        className={styles.btnSecondary}
                                        onClick={() => setImprovingAnswers(prev => ({ ...prev, [q.id]: true }))}
                                      >
                                        Improve Answer with AI ✨
                                      </button>
                                    </div>
                                  )}
                                  
                                  {improvingAnswers[q.id] && (
                                    <AnswerImprovementStudio
                                      sessionId={record.id}
                                      question={q}
                                      originalAnswer={ans.text}
                                      evaluationContext={ans.feedback || "No feedback"}
                                      config={record.config}
                                      existingData={ans.improvementData}
                                      onClose={() => setImprovingAnswers(prev => ({ ...prev, [q.id]: false }))}
                                    />
                                  )}
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
