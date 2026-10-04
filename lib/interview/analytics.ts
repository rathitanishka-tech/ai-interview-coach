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
    weaknesses
  };
}
