import { getInterviewHistory } from "../interview/storage";
import { getAnalyticsData, DimensionKey } from "../interview/analytics";
import { getQuestionsByDifficulty, Question } from "../interview/questions";

export interface PracticeTask {
  id: string;
  dimension: DimensionKey | 'general' | 'pattern' | 'progression';
  title: string;
  description: string;
  estimatedMinutes: number;
  practiceType: 'exercise' | 'question';
  questionPayload?: Question; // Present if practiceType === 'question'
  context?: {
    role: string;
    type: string;
    difficulty: string;
  };
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
    { id: 'tech-1', dimension: 'technicalAccuracy', practiceType: 'exercise', title: 'Review Core Concepts', description: 'Spend 15 minutes reviewing the foundational concepts related to your role.', estimatedMinutes: 15 },
    { id: 'tech-2', dimension: 'technicalAccuracy', practiceType: 'exercise', title: 'Explain to a Beginner', description: 'Pick a complex topic and practice explaining it in simple terms out loud.', estimatedMinutes: 10 }
  ],
  relevance: [
    { id: 'rel-1', dimension: 'relevance', practiceType: 'exercise', title: 'The "So What?" Drill', description: 'Take a past experience and explicitly state why it matters to the interviewer.', estimatedMinutes: 10 },
    { id: 'rel-2', dimension: 'relevance', practiceType: 'exercise', title: 'Question Deconstruction', description: 'Write down 3 potential interview questions and underline the core constraints of each.', estimatedMinutes: 15 }
  ],
  completeness: [
    { id: 'comp-1', dimension: 'completeness', practiceType: 'exercise', title: 'STAR Method Practice', description: 'Write down a Situation, Task, Action, and Result for 2 of your biggest achievements.', estimatedMinutes: 20 },
    { id: 'comp-2', dimension: 'completeness', practiceType: 'exercise', title: 'Rule of Three', description: 'Practice structuring answers with a beginning, middle, and end.', estimatedMinutes: 10 }
  ],
  communication: [
    { id: 'comm-1', dimension: 'communication', practiceType: 'exercise', title: 'Filler Word Elimination', description: 'Record yourself speaking for 2 minutes on a random topic. Count and identify filler words.', estimatedMinutes: 15 },
    { id: 'comm-2', dimension: 'communication', practiceType: 'exercise', title: 'Pacing Exercise', description: 'Read a technical paragraph aloud slowly and clearly, focusing on enunciation and pausing at commas.', estimatedMinutes: 10 }
  ],
  general: [
    { id: 'gen-1', dimension: 'general', practiceType: 'exercise', title: 'Mock Interview Warmup', description: 'Complete a quick 5-minute mock interview to establish baseline performance.', estimatedMinutes: 5 },
    { id: 'gen-2', dimension: 'general', practiceType: 'exercise', title: 'Resume Walkthrough', description: 'Practice your 2-minute elevator pitch and resume walkthrough out loud.', estimatedMinutes: 10 },
    { id: 'gen-3', dimension: 'general', practiceType: 'exercise', title: 'Company Research', description: 'Spend 15 minutes researching the mission, values, and recent news of a target company.', estimatedMinutes: 15 }
  ]
};

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function generateNewPlan(): PracticeTask[] {
  const history = getInterviewHistory();
  const analytics = getAnalyticsData(history);
  const weaknesses = analytics.weaknesses;
  const patterns = analytics.patterns;

  const tasks: PracticeTask[] = [];
  const todayIndex = new Date().getDate() % 2;

  // 1. Gather answered questions
  const seenSet = new Set<string>();
  let lastRole = "Frontend Developer";
  let lastType = "Technical";
  let lastDifficulty = "Medium";

  history.forEach(session => {
    lastRole = session.config.role || lastRole;
    lastType = session.config.type || lastType;
    if (session.config.difficulty) {
       lastDifficulty = session.config.difficulty; // Latest interview's difficulty
    }
    session.questions.forEach(q => {
      seenSet.add(q.text.toLowerCase().trim());
    });
  });

  // Calculate difficulty target
  let targetDifficulty = "Easy";
  
  if (lastDifficulty && ["Easy", "Medium", "Hard"].includes(lastDifficulty)) {
    targetDifficulty = lastDifficulty;
  } else if (analytics.totalInterviews > 0 && analytics.readiness) {
    if (analytics.readiness.breakdown.difficulty >= 12) targetDifficulty = "Hard";
    else if (analytics.readiness.breakdown.difficulty >= 6) targetDifficulty = "Medium";
  }

  // If sufficient data
  if (analytics.totalInterviews >= 2 && analytics.evalCount >= 5) {
    
    let priority1Added = false;

    // Priority 1: Recurring Pattern -> Targeted Question
    if (analytics.patternsStatus === 'Patterns Detected' && patterns.length > 0) {
      const topPattern = patterns[0];
      const candidateQuestions = getQuestionsByDifficulty({ role: lastRole, type: "Technical" }, 20, targetDifficulty, []);
      const unseen = candidateQuestions.find(q => !seenSet.has(q.text.toLowerCase().trim()));
      
      if (unseen) {
        tasks.push({
          id: `smart-pattern-${topPattern.id}`,
          dimension: 'pattern',
          practiceType: 'question',
          title: `Break the Habit: ${topPattern.title}`,
          description: `Recommended because you frequently exhibited this anti-pattern across ${topPattern.frequency} past answers. Practice this ${targetDifficulty} question to improve.`,
          estimatedMinutes: 5,
          questionPayload: unseen,
          context: { role: lastRole, type: "Technical", difficulty: targetDifficulty }
        });
        seenSet.add(unseen.text.toLowerCase().trim());
        priority1Added = true;
      }
    }

    // Priority 1 fallback if no patterns: Difficulty Progression -> Targeted Question
    if (!priority1Added && targetDifficulty === "Hard") {
      const candidateQuestions = getQuestionsByDifficulty({ role: lastRole, type: lastType }, 20, "Hard", []);
      const unseen = candidateQuestions.find(q => !seenSet.has(q.text.toLowerCase().trim()));
      if (unseen) {
        tasks.push({
          id: `smart-progression-hard`,
          dimension: 'progression',
          practiceType: 'question',
          title: `Challenge: Hard Question Mastery`,
          description: `Recommended because you have demonstrated strong fundamentals and high readiness. Tackle this Hard question to push your limits.`,
          estimatedMinutes: 8,
          questionPayload: unseen,
          context: { role: lastRole, type: lastType, difficulty: "Hard" }
        });
        seenSet.add(unseen.text.toLowerCase().trim());
        priority1Added = true;
      }
    }

    // Priority 2 & 3: Weakest skill dimension & Generic
    if (weaknesses.length > 0) {
      const topWeakness = weaknesses[0];
      const wTasks = TASK_LIBRARY[topWeakness.key];
      tasks.push({
        ... (wTasks[todayIndex] || wTasks[0]),
        practiceType: 'exercise',
        title: `Skill Builder: ${wTasks[todayIndex]?.title || wTasks[0].title}`,
        description: `Recommended because your ${topWeakness.label} score averages ${topWeakness.avg}/100. ${wTasks[todayIndex]?.description || wTasks[0].description}`
      });
      
      if (!priority1Added && weaknesses.length > 1) {
         const w2Tasks = TASK_LIBRARY[weaknesses[1].key];
         tasks.push({
           ... (w2Tasks[todayIndex] || w2Tasks[0]),
           practiceType: 'exercise'
         });
      }
    }

    // Ensure we have exactly 3 tasks by padding with general exercises
    while (tasks.length < 3) {
      const gTask = TASK_LIBRARY.general[tasks.length % 3];
      tasks.push({ ...gTask, practiceType: 'exercise' });
    }
  } else {
    // Insufficient Data -> Generic beginner warm-ups
    tasks.push({ ...TASK_LIBRARY.general[0], practiceType: 'exercise', description: 'Recommended as a beginner warm-up to establish your baseline.' });
    tasks.push({ ...TASK_LIBRARY.general[1], practiceType: 'exercise' });
    tasks.push({ ...TASK_LIBRARY.general[2], practiceType: 'exercise' });
  }

  return tasks.slice(0, 3);
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
