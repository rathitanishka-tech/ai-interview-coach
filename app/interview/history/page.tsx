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

  // Aggregation for Skill Analytics
  let totalTech = 0, totalRel = 0, totalComp = 0, totalComm = 0;
  let evalCount = 0;

  history.forEach(record => {
    Object.values(record.answers).forEach(ans => {
      if (ans.evaluationStatus === 'evaluated' && ans.evaluation) {
        totalTech += ans.evaluation.technicalAccuracy || 0;
        totalRel += ans.evaluation.relevance || 0;
        totalComp += ans.evaluation.completeness || 0;
        totalComm += ans.evaluation.communication || 0;
        evalCount++;
      }
    });
  });

  const avgTech = evalCount > 0 ? Math.round(totalTech / evalCount) : 0;
  const avgRel = evalCount > 0 ? Math.round(totalRel / evalCount) : 0;
  const avgComp = evalCount > 0 ? Math.round(totalComp / evalCount) : 0;
  const avgComm = evalCount > 0 ? Math.round(totalComm / evalCount) : 0;

  // Chronological data for Trend Chart
  const trendData = [...history].sort((a, b) => a.timestamp - b.timestamp);

  // Weakness Detection Logic
  type DimensionKey = 'technicalAccuracy' | 'relevance' | 'completeness' | 'communication';
  const dimensionLabels: Record<DimensionKey, string> = {
    technicalAccuracy: "Technical Accuracy",
    relevance: "Relevance",
    completeness: "Completeness",
    communication: "Communication"
  };
  const recommendationDict: Record<DimensionKey, string> = {
    technicalAccuracy: "Review core concepts for your role. When uncertain, be honest about what you know and describe how you would find the answer rather than guessing.",
    relevance: "Practice the STAR method. Ensure every sentence directly answers the prompt. Avoid going on tangents about unrelated technologies or experiences.",
    completeness: "Use the Rule of 3. Ensure your answers have a clear beginning (context), middle (action/details), and end (results). Always include a concrete example.",
    communication: "Record yourself answering mock questions. Focus on eliminating filler words, speaking at a measured pace, and structuring your thoughts logically."
  };

  const dimScores: Record<DimensionKey, number[]> = {
    technicalAccuracy: [],
    relevance: [],
    completeness: [],
    communication: []
  };

  trendData.forEach(record => {
    Object.values(record.answers).forEach(ans => {
      if (ans.evaluationStatus === 'evaluated' && ans.evaluation) {
        dimScores.technicalAccuracy.push(ans.evaluation.technicalAccuracy);
        dimScores.relevance.push(ans.evaluation.relevance);
        dimScores.completeness.push(ans.evaluation.completeness);
        dimScores.communication.push(ans.evaluation.communication);
      }
    });
  });

  const WEAKNESS_THRESHOLD = 80;
  
  const weaknesses = (Object.keys(dimScores) as DimensionKey[])
    .map(key => {
      const scores = dimScores[key];
      if (scores.length === 0) return null;
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      
      let trendStatus = "Insufficient trend data";
      let trendClass = styles.trendInsufficient;
      
      if (scores.length >= 4) {
        const half = Math.floor(scores.length / 2);
        const olderHalf = scores.slice(0, half);
        const newerHalf = scores.slice(half);
        const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length;
        const newerAvg = newerHalf.reduce((a, b) => a + b, 0) / newerHalf.length;
        
        if (newerAvg > olderAvg + 5) {
          trendStatus = "Improving 📈";
          trendClass = styles.trendImproving;
        } else if (newerAvg < olderAvg - 5) {
          trendStatus = "Declining 📉";
          trendClass = styles.trendDeclining;
        } else {
          trendStatus = "Stable ➖";
          trendClass = styles.trendStable;
        }
      }
      
      return {
        key,
        label: dimensionLabels[key],
        avg,
        trendStatus,
        trendClass,
        recommendation: recommendationDict[key]
      };
    })
    .filter((w): w is NonNullable<typeof w> => 
      w !== null && 
      w.avg < WEAKNESS_THRESHOLD && 
      dimScores[w.key].filter(score => score < WEAKNESS_THRESHOLD).length >= 2
    )
    .sort((a, b) => a.avg - b.avg); // Rank lowest first

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
                        <div className={`${styles.trendBadge} ${w.trendClass}`}>
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
