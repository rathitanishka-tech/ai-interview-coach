import { getInterviewHistory } from "../interview/storage";
import { getAnalyticsData, DimensionKey } from "../interview/analytics";
import { PracticeTask } from "../practice/storage";
import { getQuestionsByDifficulty } from "../interview/questions";

export interface RoadmapTask extends PracticeTask {
  reason: string;
}

export interface RoadmapDay {
  dayNumber: number;
  focusArea: string;
  tasks: RoadmapTask[];
}

export interface InterviewRoadmap {
  id: string;
  createdAt: number;
  targetRole: string;
  targetDifficulty: string;
  readinessSnapshot: number;
  days: RoadmapDay[];
}

const STORAGE_KEY = 'ai_interview_coach_roadmap';

export function getCalendarDaysDiff(createdAt: number, now: number): number {
  const startOfCreated = new Date(createdAt);
  startOfCreated.setHours(0, 0, 0, 0);
  const startOfNow = new Date(now);
  startOfNow.setHours(0, 0, 0, 0);
  // Math.round handles DST transitions safely
  return Math.round((startOfNow.getTime() - startOfCreated.getTime()) / 86400000);
}

export function getRoadmap(): InterviewRoadmap | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const roadmap = JSON.parse(raw) as InterviewRoadmap;
    
    // Expire if it has been 7 full calendar days since creation (i.e. we are on day 8+)
    if (getCalendarDaysDiff(roadmap.createdAt, Date.now()) >= 7) {
      clearRoadmap();
      return null;
    }
    return roadmap;
  } catch (e) {
    console.error("Error reading roadmap", e);
    return null;
  }
}

export function saveRoadmap(roadmap: InterviewRoadmap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmap));
  } catch (e) {
    console.error("Error saving roadmap", e);
  }
}

export function clearRoadmap(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function generateRoadmap(): InterviewRoadmap {
  const history = getInterviewHistory();
  const analytics = getAnalyticsData(history);
  
  // Deterministic fallbacks
  let targetRole = "Frontend Developer";
  let targetDifficulty = "Medium";
  if (history.length > 0) {
    targetRole = history[history.length - 1].config.role || targetRole;
    targetDifficulty = history[history.length - 1].config.difficulty || targetDifficulty;
  }

  const id = `roadmap-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()}`;
  const days: RoadmapDay[] = [];
  
  // Basic helper to generate a question task
  const createQTask = (taskId: string, title: string, diff: string, reason: string, dim: DimensionKey | 'general' | 'pattern' | 'progression'): RoadmapTask => {
    const qs = getQuestionsByDifficulty({ role: targetRole, type: "Technical" }, 20, diff, []);
    const q = qs[Math.floor(Math.random() * qs.length)];
    return {
      id: taskId,
      dimension: dim,
      practiceType: 'question',
      title,
      description: 'Practice answering this question to improve your performance.',
      estimatedMinutes: 5,
      questionPayload: q,
      context: { role: targetRole, type: "Technical", difficulty: diff },
      reason
    };
  };

  const createExTask = (taskId: string, title: string, desc: string, reason: string, dim: DimensionKey | 'general'): RoadmapTask => {
    return {
      id: taskId,
      dimension: dim,
      practiceType: 'exercise',
      title,
      description: desc,
      estimatedMinutes: 10,
      reason
    };
  };

  const w1 = analytics.weaknesses.length > 0 ? analytics.weaknesses[0] : null;
  const w2 = analytics.weaknesses.length > 1 ? analytics.weaknesses[1] : null;
  const hasPatterns = analytics.patternsStatus === 'Patterns Detected' && analytics.patterns.length > 0;

  // Day 1: Biggest Weakness
  if (w1) {
    days.push({
      dayNumber: 1,
      focusArea: `Core Weakness: ${w1.label}`,
      tasks: [
        createExTask(`${id}-d1-1`, 'Fundamental Review', `Focus on improving your ${w1.label}.`, `Your ${w1.label} score is ${w1.avg}/100.`, w1.key),
        createQTask(`${id}-d1-2`, 'Targeted Practice', targetDifficulty, `Apply your ${w1.label} review to a real question.`, w1.key)
      ]
    });
  } else {
    days.push({
      dayNumber: 1,
      focusArea: `Baseline Assessment`,
      tasks: [
        createExTask(`${id}-d1-1`, 'Resume Walkthrough', 'Practice your 2-minute elevator pitch.', 'Establish a strong communication baseline.', 'communication'),
        createQTask(`${id}-d1-2`, 'Warmup Question', targetDifficulty, 'Get comfortable with the interview format.', 'general')
      ]
    });
  }

  // Day 2: Pattern Elimination
  if (hasPatterns) {
    const p = analytics.patterns[0];
    days.push({
      dayNumber: 2,
      focusArea: `Break the Habit: ${p.title}`,
      tasks: [
        createQTask(`${id}-d2-1`, 'Pattern Breaker Drill', targetDifficulty, `You exhibited this pattern ${p.frequency} times. Practice avoiding it.`, 'pattern'),
        createExTask(`${id}-d2-2`, 'Self-Reflection', `Review past answers where you showed: ${p.title}.`, `Awareness is the first step to breaking a bad habit.`, 'general')
      ]
    });
  } else {
    days.push({
      dayNumber: 2,
      focusArea: `Consistency & Structure`,
      tasks: [
        createExTask(`${id}-d2-1`, 'STAR Method Drill', 'Outline the Situation, Task, Action, and Result for 2 past achievements.', 'You have no major negative patterns, so focus on robust structure.', 'completeness'),
        createQTask(`${id}-d2-2`, 'Structured Answer Practice', targetDifficulty, 'Apply the STAR method to this question.', 'completeness')
      ]
    });
  }

  // Day 3: Secondary Weakness or Generic
  if (w2) {
    days.push({
      dayNumber: 3,
      focusArea: `Secondary Growth: ${w2.label}`,
      tasks: [
        createExTask(`${id}-d3-1`, 'Targeted Review', `Focus on improving your ${w2.label}.`, `Your ${w2.label} score is ${w2.avg}/100.`, w2.key),
        createQTask(`${id}-d3-2`, 'Applied Practice', targetDifficulty, `Apply your ${w2.label} review to a real question.`, w2.key)
      ]
    });
  } else {
    days.push({
      dayNumber: 3,
      focusArea: `Communication Check`,
      tasks: [
        createExTask(`${id}-d3-1`, 'Pacing & Tone', 'Record yourself speaking for 2 minutes and check your pace.', 'Ensure your delivery matches your strong technical skills.', 'communication'),
        createQTask(`${id}-d3-2`, 'Verbal Delivery', targetDifficulty, 'Answer this question while focusing on tone and pace.', 'communication')
      ]
    });
  }

  // Day 4: Difficulty Challenge
  let pushDifficulty = targetDifficulty;
  if (analytics.readiness && analytics.readiness.breakdown.difficulty >= 6 && targetDifficulty === 'Easy') pushDifficulty = 'Medium';
  else if (analytics.readiness && analytics.readiness.breakdown.difficulty >= 12 && targetDifficulty === 'Medium') pushDifficulty = 'Hard';
  else if (targetDifficulty === 'Easy') pushDifficulty = 'Medium';
  else if (targetDifficulty === 'Medium') pushDifficulty = 'Hard';

  days.push({
    dayNumber: 4,
    focusArea: `Difficulty Challenge: ${pushDifficulty}`,
    tasks: [
      createQTask(`${id}-d4-1`, `Challenge Question 1`, pushDifficulty, `Pushing your boundaries to ${pushDifficulty} difficulty.`, 'progression'),
      createQTask(`${id}-d4-2`, `Challenge Question 2`, pushDifficulty, `Another ${pushDifficulty} question to solidify your skills.`, 'progression')
    ]
  });

  // Day 5: Behavioral & Completeness
  let commScore = 0;
  if (history.length > 0) {
     const evalCount = history.reduce((acc, h) => acc + Object.values(h.answers).filter(a => a.evaluationStatus === 'evaluated').length, 0);
     const totalComm = history.reduce((acc, h) => acc + Object.values(h.answers).reduce((sum, a) => sum + (a.evaluationStatus === 'evaluated' ? a.evaluation!.communication : 0), 0), 0);
     commScore = evalCount > 0 ? totalComm / evalCount : 0;
  }

  if (commScore > 85) {
    days.push({
      dayNumber: 5,
      focusArea: `Role-Specific Deep Dive`,
      tasks: [
        createQTask(`${id}-d5-1`, 'Technical Deep Dive', targetDifficulty, 'Your communication is strong (>85). Focusing on technical depth.', 'technicalAccuracy'),
        createQTask(`${id}-d5-2`, 'Domain Knowledge', targetDifficulty, 'Ensure your domain knowledge is rock solid.', 'technicalAccuracy')
      ]
    });
  } else {
    days.push({
      dayNumber: 5,
      focusArea: `Behavioral Mastery`,
      tasks: [
        createExTask(`${id}-d5-1`, 'Filler Word Elimination', 'Record yourself and count filler words.', 'Refining your delivery and professional presence.', 'communication'),
        createQTask(`${id}-d5-2`, 'Behavioral Prompt', targetDifficulty, 'Focus purely on clarity and delivery.', 'communication')
      ]
    });
  }

  // Day 6: Role-Specific Simulation
  days.push({
    dayNumber: 6,
    focusArea: `Role Simulation: ${targetRole}`,
    tasks: [
      createQTask(`${id}-d6-1`, 'Role Simulation Q1', targetDifficulty, 'Tailored strictly for your target role.', 'relevance'),
      createQTask(`${id}-d6-2`, 'Role Simulation Q2', targetDifficulty, 'Preparing you for the exact expectations of the role.', 'relevance')
    ]
  });

  // Day 7: Full Mock
  days.push({
    dayNumber: 7,
    focusArea: `Final Mock Interview`,
    tasks: [
      createExTask(`${id}-d7-1`, 'Mental Prep', 'Review your STAR stories and take a deep breath.', 'Preparation before the final test.', 'general'),
      createQTask(`${id}-d7-2`, 'Full Mock Question', targetDifficulty, 'Simulating the real interview environment.', 'general')
    ]
  });

  const roadmap: InterviewRoadmap = {
    id,
    createdAt: Date.now(),
    targetRole,
    targetDifficulty,
    readinessSnapshot: analytics.readiness?.score || 0,
    days
  };

  saveRoadmap(roadmap);
  return roadmap;
}
