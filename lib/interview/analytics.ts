import { InterviewHistoryRecord } from "./storage";

export type DimensionKey = 'technicalAccuracy' | 'relevance' | 'completeness' | 'communication';

export interface Weakness {
  key: DimensionKey;
  label: string;
  avg: number;
  trendStatus: string;
  trendType: 'improving' | 'declining' | 'stable' | 'insufficient';
  recommendation: string;
}

export interface ReadinessData {
  score: number | null; // null if insufficient data
  breakdown: {
    baseScore: number;
    consistency: number;
    difficulty: number;
  };
  status: 'Interview Ready' | 'Approaching Readiness' | 'Needs Practice' | 'Insufficient Data';
  clusterCount: number;
  explanation: string;
}

export interface AnalyticsData {
  totalInterviews: number;
  totalQuestions: number;
  averageScore: number;
  evalCount: number;
  avgTech: number;
  avgRel: number;
  avgComp: number;
  avgComm: number;
  trendData: InterviewHistoryRecord[];
  weaknesses: Weakness[];
  readiness: ReadinessData;
}

export const WEAKNESS_THRESHOLD = 80;

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

export function getAnalyticsData(history: InterviewHistoryRecord[]): AnalyticsData {
  const totalInterviews = history.length;
  const totalQuestions = history.reduce((acc, curr) => {
    return acc + Object.keys(curr.answers).filter(k => curr.answers[k].text.trim()).length;
  }, 0);
  
  const averageScore = totalInterviews > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.overallScore, 0) / totalInterviews)
    : 0;

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

  const trendData = [...history].sort((a, b) => a.timestamp - b.timestamp);

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

  const weaknesses = (Object.keys(dimScores) as DimensionKey[])
    .map(key => {
      const scores = dimScores[key];
      if (scores.length === 0) return null;
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      
      let trendStatus = "Insufficient trend data";
      let trendType: Weakness['trendType'] = 'insufficient';
      
      if (scores.length >= 4) {
        const half = Math.floor(scores.length / 2);
        const olderHalf = scores.slice(0, half);
        const newerHalf = scores.slice(half);
        const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length;
        const newerAvg = newerHalf.reduce((a, b) => a + b, 0) / newerHalf.length;
        
        if (newerAvg > olderAvg + 5) {
          trendStatus = "Improving 📈";
          trendType = 'improving';
        } else if (newerAvg < olderAvg - 5) {
          trendStatus = "Declining 📉";
          trendType = 'declining';
        } else {
          trendStatus = "Stable ➖";
          trendType = 'stable';
        }
      }
      
      return {
        key,
        label: dimensionLabels[key],
        avg,
        trendStatus,
        trendType,
        recommendation: recommendationDict[key]
      };
    })
    .filter((w): w is NonNullable<typeof w> => 
      w !== null && 
      w.avg < WEAKNESS_THRESHOLD && 
      dimScores[w.key].filter(score => score < WEAKNESS_THRESHOLD).length >= 2
    )
    .sort((a, b) => a.avg - b.avg);

  // --- Phase 10A: Readiness Calculation ---
  const clusters: { score: number, difficulty: string }[] = [];
  
  trendData.forEach(record => {
    const recordClusters: Record<string, { total: number, count: number, diff: string }> = {};
    
    record.questions.forEach(q => {
      const ans = record.answers[q.id];
      if (ans && ans.evaluationStatus === 'evaluated' && ans.evaluation) {
        const clusterId = q.originalId || q.id;
        if (!recordClusters[clusterId]) {
          recordClusters[clusterId] = { total: 0, count: 0, diff: q.difficulty || "Medium" };
        }
        recordClusters[clusterId].total += ans.evaluation.score;
        recordClusters[clusterId].count++;
        if (!q.isFollowUp && q.difficulty) {
          recordClusters[clusterId].diff = q.difficulty;
        }
      }
    });
    
    Object.values(recordClusters).forEach(c => {
      if (c.count > 0) {
        clusters.push({ score: c.total / c.count, difficulty: c.diff });
      }
    });
  });

  const clusterCount = clusters.length;
  let readiness: ReadinessData = {
    score: null,
    breakdown: { baseScore: 0, consistency: 0, difficulty: 0 },
    status: 'Insufficient Data',
    clusterCount,
    explanation: "Complete at least 5 evaluated questions to generate your Readiness Score."
  };

  if (clusterCount >= 5) {
    // 1. Base Score (Max 70 points)
    const baseRaw = 70 * (
      (avgTech / 100) * 0.35 +
      (avgRel / 100) * 0.25 +
      (avgComp / 100) * 0.20 +
      (avgComm / 100) * 0.20
    );
    const baseScore = Math.max(0, Math.min(70, baseRaw));

    // 2. Consistency Score (Max 15 points)
    const mean = clusters.reduce((sum, c) => sum + c.score, 0) / clusterCount;
    const variance = clusters.reduce((sum, c) => sum + Math.pow(c.score - mean, 2), 0) / clusterCount;
    let sd = Math.sqrt(variance);

    // Calculate linear trend (slope) to detect improvement
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    clusters.forEach((c, i) => {
        sumX += i;
        sumY += c.score;
        sumXY += i * c.score;
        sumX2 += i * i;
    });
    const slope = clusterCount > 1 ? (clusterCount * sumXY - sumX * sumY) / (clusterCount * sumX2 - sumX * sumX) : 0;
    
    // If improving, forgive some variance conservatively (max 5 points of SD or 30% of SD)
    if (slope > 0) {
        const maxForgiveness = Math.min(5, sd * 0.3);
        const actualForgiveness = Math.min(maxForgiveness, slope * 2);
        sd = Math.max(0, sd - actualForgiveness); 
    }

    // Map SD to 15 points (SD of 0 = 15, SD >= 25 = 0)
    const consistency = Math.max(0, Math.min(15, 15 - (sd / 25) * 15));

    // 3. Difficulty Index (Max 15 points)
    const masteredClusters = clusters.filter(c => c.score >= 75);
    let difficulty = 0;
    if (masteredClusters.length > 0) {
      let diffSum = 0;
      masteredClusters.forEach(c => {
          if (c.difficulty === "Hard") diffSum += 1.0;
          else if (c.difficulty === "Medium") diffSum += 0.66;
          else diffSum += 0.33; // Easy or unrecognized (legacy)
      });
      const avgMultiplier = diffSum / masteredClusters.length;
      difficulty = Math.max(0, Math.min(15, avgMultiplier * 15));
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore + consistency + difficulty)));
    
    let status: ReadinessData['status'] = 'Needs Practice';
    if (finalScore >= 80 && difficulty >= 7) {
      status = 'Interview Ready';
    } else if (finalScore >= 60) {
      status = 'Approaching Readiness';
    }

    // Generate grounded explanation
    let explanation = "Your core technical and communication skills are establishing a solid baseline.";
    if (difficulty < 7) {
      explanation = "You are demonstrating consistency, but your score is limited because you haven't mastered enough Medium or Hard questions. Challenge yourself to increase your readiness.";
    } else if (consistency < 8) {
      explanation = "Your performance is highly inconsistent. Focus on structuring your answers reliably across all topics, even ones you find difficult.";
    } else if (finalScore >= 80) {
      explanation = "You are demonstrating strong, consistent mastery across challenging topics. While this doesn't guarantee passing a real interview, your fundamentals are highly competitive.";
    } else if (finalScore >= 60) {
      explanation = "You are approaching readiness. Focus on your specific weaknesses below to bridge the gap to a competitive level.";
    }

    readiness = {
      score: finalScore,
      breakdown: { baseScore, consistency, difficulty },
      status,
      clusterCount,
      explanation
    };
  }

  return {
    totalInterviews,
    totalQuestions,
    averageScore,
    evalCount,
    avgTech,
    avgRel,
    avgComp,
    avgComm,
    trendData,
    weaknesses,
    readiness
  };
}
