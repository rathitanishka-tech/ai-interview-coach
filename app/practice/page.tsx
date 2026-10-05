"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./practice.module.css";
import { getPracticeState, toggleTaskCompletion, PracticeState, PracticeTask } from "@/lib/practice/storage";
import { getRoadmap, generateRoadmap, clearRoadmap, InterviewRoadmap, RoadmapTask, getCalendarDaysDiff } from "@/lib/roadmap/storage";

const DIMENSION_LABELS: Record<string, string> = {
  technicalAccuracy: "Technical Accuracy",
  relevance: "Relevance",
  completeness: "Completeness",
  communication: "Communication",
  general: "General Practice",
  pattern: "Pattern Check",
  progression: "Progression"
};

export default function PracticePage() {
  const router = useRouter();
  const [state, setState] = useState<PracticeState | null>(null);
  const [roadmap, setRoadmap] = useState<InterviewRoadmap | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    try {
      const s = getPracticeState();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(s);
      
      const r = getRoadmap();
      if (r) {
        // Expiration is now handled directly by getRoadmap() using calendar days
        setRoadmap(r);
      }
      setNow(Date.now());
    } catch (e) {
      console.error(e);
      setError(true);
    }
  }, []);

  const handleToggle = (taskId: string, currentStatus: boolean) => {
    try {
      const newState = toggleTaskCompletion(taskId, !currentStatus);
      setState(newState);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartPractice = (task: PracticeTask | RoadmapTask) => {
    if (task.practiceType === 'question' && task.questionPayload && task.context) {
      sessionStorage.setItem("interviewConfig", JSON.stringify({
        role: task.context.role,
        experience: "Practice",
        type: task.context.type,
        difficulty: task.context.difficulty,
        questions: 1
      }));
      sessionStorage.setItem("practiceQuestion", JSON.stringify(task.questionPayload));
      sessionStorage.setItem("practiceTaskId", task.id);
      router.push("/interview/session?mode=practice");
    }
  };

  const handleGenerateRoadmap = () => {
    const r = generateRoadmap();
    setRoadmap(r);
    setState(getPracticeState()); // refresh practice state
  };

  const handleRestartRoadmap = () => {
    clearRoadmap();
    handleGenerateRoadmap();
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Unable to Load Practice Plan</h2>
          <p>Please check your browser settings or try again later.</p>
          <Link href="/" style={{marginTop: '1rem', display: 'inline-block'}}>Return Home</Link>
        </div>
      </div>
    );
  }

  if (!state || now === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <h2>Loading your practice plan...</h2>
        </div>
      </div>
    );
  }

  const dailyTotalCount = state.tasks.length;
  const dailyCompletedCount = state.tasks.filter(t => state.completedTaskIds.includes(t.id)).length;
  const progressPercent = dailyTotalCount > 0 ? (dailyCompletedCount / dailyTotalCount) * 100 : 0;
  const totalMinutes = state.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const currentDayIndex = roadmap ? getCalendarDaysDiff(roadmap.createdAt, now) + 1 : 0;

  const renderTaskCard = (task: PracticeTask | RoadmapTask) => {
    const isCompleted = state.completedTaskIds.includes(task.id);
    const dimensionName = DIMENSION_LABELS[task.dimension] || task.dimension;
    const isRTask = 'reason' in task;
    const reason = isRTask ? (task as RoadmapTask).reason : (task.dimension === 'general' ? 'Core preparation and warmup' : `Targeted practice to improve your ${dimensionName}`);

    return (
      <div key={task.id} className={`${styles.taskCard} ${isCompleted ? styles.taskCardCompleted : ''}`}>
        <div className={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            className={styles.checkbox}
            checked={isCompleted}
            onChange={() => handleToggle(task.id, isCompleted)}
            title="Mark as complete"
          />
        </div>
        <div className={styles.taskContent}>
          <div className={styles.taskMeta}>
            <span>{dimensionName}</span>
            <span>{task.estimatedMinutes} MIN</span>
          </div>
          <h3 className={styles.taskTitle}>{task.title}</h3>
          <p className={styles.taskDesc}>{task.description}</p>
          
          {task.practiceType === 'question' && task.questionPayload && (
            <div className={styles.questionPreview}>
              <div className={styles.questionBadge}>{task.context?.difficulty} {task.context?.type}</div>
              <div className={styles.questionText}>&quot;{task.questionPayload.text}&quot;</div>
              <button 
                className={styles.startPracticeBtn} 
                onClick={() => handleStartPractice(task)}
              >
                Start Practice Session
              </button>
            </div>
          )}

          {task.practiceType !== 'question' && (
            <div className={styles.taskReason}>
              💡 {reason}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <Link href="/" className={styles.brand}>AI Interview Coach</Link>
        <nav className={styles.navLinks}>
          <Link href="/interview/setup" className={styles.navLink}>New Interview</Link>
          <Link href="/interview/history" className={styles.navLink}>History</Link>
        </nav>
      </header>

      <main>
        {roadmap ? (
          <div className={styles.roadmapSection}>
            <div className={styles.header}>
              <h1 className={styles.title}>Your 7-Day Roadmap</h1>
              <p className={styles.subtitle}>Targeting {roadmap.targetRole} • Difficulty: {roadmap.targetDifficulty} • Baseline Readiness: {roadmap.readinessSnapshot}</p>
              <button onClick={handleRestartRoadmap} className={styles.btnSecondary} style={{marginTop: '1rem'}}>Restart Roadmap</button>
            </div>
            
            <div className={styles.roadmapTimeline}>
              {roadmap.days.map(day => {
                const isCurrent = day.dayNumber === currentDayIndex || (currentDayIndex > 7 && day.dayNumber === 7);
                const isPast = day.dayNumber < currentDayIndex;
                const isLocked = day.dayNumber > currentDayIndex;
                const dayTasks = day.tasks;
                const allCompleted = dayTasks.every(t => state.completedTaskIds.includes(t.id));

                return (
                  <div key={day.dayNumber} className={`${styles.roadmapDay} ${isCurrent ? styles.roadmapDayCurrent : ''} ${isPast ? styles.roadmapDayPast : ''} ${isLocked ? styles.roadmapDayLocked : ''}`}>
                    <div className={styles.roadmapDayHeader}>
                      <h3>Day {day.dayNumber}: {day.focusArea}</h3>
                      {allCompleted && <span className={styles.badgeSuccess}>✓ Completed</span>}
                    </div>
                    {isCurrent && (
                      <div className={styles.taskList}>
                         {dayTasks.map(t => renderTaskCard(t))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={styles.roadmapCta}>
            <div className={styles.header}>
              <h1 className={styles.title}>Unified Practice Hub</h1>
            </div>
            <div className={styles.ctaCard}>
              <h2>Ready for a structured plan?</h2>
              <p>Generate a personalized 7-day interview roadmap based on your analytics. We&apos;ll create a day-by-day plan mapping exactly to your weaknesses and anti-patterns.</p>
              <button onClick={handleGenerateRoadmap} className={styles.btnPrimary}>Build My 7-Day Roadmap</button>
            </div>
          </div>
        )}

        <hr className={styles.divider} />

        <div className={styles.header}>
          <h2 className={styles.title}>Today&apos;s Practice Plan</h2>
          <p className={styles.subtitle}>{todayStr} • {totalMinutes} minutes total</p>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <h2>Today&apos;s Progress</h2>
            <span>{dailyCompletedCount} of {dailyTotalCount} completed</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className={styles.taskList}>
          {state.tasks.map(t => renderTaskCard(t))}
        </div>
      </main>
    </div>
  );
}
