import { getInterviewHistory } from "../interview/storage";
import { getAnalyticsData, DimensionKey } from "../interview/analytics";

export interface PracticeTask {
  id: string;
  dimension: DimensionKey | 'general';
  title: string;
  description: string;
  estimatedMinutes: number;
}

export interface PracticeState {
  lastGeneratedDate: string; // YYYY-MM-DD
  tasks: PracticeTask[];
  completedTaskIds: string[];
}

const STORAGE_KEY = 'ai_interview_coach_practice_state';

// Static Practice Task Library
const TASK_LIBRARY: Record<DimensionKey | 'general', PracticeTask[]> = {
  technicalAccuracy: [
    { id: 'tech-1', dimension: 'technicalAccuracy', title: 'Review Core Concepts', description: 'Spend 15 minutes reviewing the foundational concepts related to your role.', estimatedMinutes: 15 },
    { id: 'tech-2', dimension: 'technicalAccuracy', title: 'Explain to a Beginner', description: 'Pick a complex topic and practice explaining it in simple terms out loud.', estimatedMinutes: 10 }
  ],
  relevance: [
    { id: 'rel-1', dimension: 'relevance', title: 'The "So What?" Drill', description: 'Take a past experience and explicitly state why it matters to the interviewer.', estimatedMinutes: 10 },
    { id: 'rel-2', dimension: 'relevance', title: 'Question Deconstruction', description: 'Write down 3 potential interview questions and underline the core constraints of each.', estimatedMinutes: 15 }
  ],
  completeness: [
    { id: 'comp-1', dimension: 'completeness', title: 'STAR Method Practice', description: 'Write down a Situation, Task, Action, and Result for 2 of your biggest achievements.', estimatedMinutes: 20 },
    { id: 'comp-2', dimension: 'completeness', title: 'Rule of Three', description: 'Practice structuring answers with a beginning, middle, and end.', estimatedMinutes: 10 }
  ],
  communication: [
    { id: 'comm-1', dimension: 'communication', title: 'Filler Word Elimination', description: 'Record yourself speaking for 2 minutes on a random topic. Count and identify filler words.', estimatedMinutes: 15 },
    { id: 'comm-2', dimension: 'communication', title: 'Pacing Exercise', description: 'Read a technical paragraph aloud slowly and clearly, focusing on enunciation and pausing at commas.', estimatedMinutes: 10 }
  ],
  general: [
    { id: 'gen-1', dimension: 'general', title: 'Mock Interview Warmup', description: 'Complete a quick 5-minute mock interview to establish baseline performance.', estimatedMinutes: 5 },
    { id: 'gen-2', dimension: 'general', title: 'Resume Walkthrough', description: 'Practice your 2-minute elevator pitch and resume walkthrough out loud.', estimatedMinutes: 10 },
    { id: 'gen-3', dimension: 'general', title: 'Company Research', description: 'Spend 15 minutes researching the mission, values, and recent news of a target company.', estimatedMinutes: 15 }
  ]
};

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function generateNewPlan(): PracticeTask[] {
  const history = getInterviewHistory();
  const analytics = getAnalyticsData(history);
  const weaknesses = analytics.weaknesses;

  const tasks: PracticeTask[] = [];

  // Deterministic daily rotation index (0 or 1) based on day of month
  const todayIndex = new Date().getDate() % 2;

  if (analytics.totalInterviews >= 2 && analytics.evalCount >= 5 && weaknesses.length > 0) {
    const topWeaknesses = weaknesses.slice(0, 2);
    
    // Add task from #1 weakness
    const w1Tasks = TASK_LIBRARY[topWeaknesses[0].key];
    tasks.push(w1Tasks[todayIndex] || w1Tasks[0]);
    
    if (topWeaknesses.length > 1) {
      // Add task from #2 weakness
      const w2Tasks = TASK_LIBRARY[topWeaknesses[1].key];
      tasks.push(w2Tasks[todayIndex] || w2Tasks[0]);
    } else {
      // If only 1 weakness, add a second task from that weakness
      tasks.push(w1Tasks[todayIndex === 0 ? 1 : 0] || TASK_LIBRARY.general[0]);
    }
    
    // Always add one general practice task to round it out
    tasks.push(TASK_LIBRARY.general[0]);
  } else {
    // Sensible Default Plan for Insufficient Data
    tasks.push(TASK_LIBRARY.general[0]);
    tasks.push(TASK_LIBRARY.general[1]);
    tasks.push(TASK_LIBRARY.general[2]);
  }

  return tasks;
}

export function getPracticeState(): PracticeState {
  const today = getTodayString();
  
  if (typeof window === 'undefined') {
    return { lastGeneratedDate: today, tasks: [], completedTaskIds: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state = JSON.parse(raw) as PracticeState;
      
      // If the plan is from today, restore it (preserves completed tasks)
      if (state.lastGeneratedDate === today && Array.isArray(state.tasks) && Array.isArray(state.completedTaskIds)) {
        return state;
      }
    }
  } catch (e) {
    console.error("Error reading practice state", e);
  }

  // Generate a fresh plan for a new day (or if data was malformed)
  const newState: PracticeState = {
    lastGeneratedDate: today,
    tasks: generateNewPlan(),
    completedTaskIds: [] // Fresh start for the new day
  };

  savePracticeState(newState);
  return newState;
}

export function savePracticeState(state: PracticeState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving practice state", e);
  }
}

export function toggleTaskCompletion(taskId: string, completed: boolean): PracticeState {
  const state = getPracticeState();
  if (completed) {
    if (!state.completedTaskIds.includes(taskId)) {
      state.completedTaskIds.push(taskId);
    }
  } else {
    state.completedTaskIds = state.completedTaskIds.filter(id => id !== taskId);
  }
  savePracticeState(state);
  return state;
}
