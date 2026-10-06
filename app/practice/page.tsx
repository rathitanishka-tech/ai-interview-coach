"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./practice.module.css";
import { getPracticeState, toggleTaskCompletion, PracticeState, PracticeTask } from "@/lib/practice/storage";

const DIMENSION_LABELS: Record<string, string> = {
  technicalAccuracy: "Technical Accuracy",
  relevance: "Relevance",
  completeness: "Completeness",
  communication: "Communication",
  general: "General Practice"
};

export default function PracticePage() {
  const router = useRouter();
  const [state, setState] = useState<PracticeState | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    try {
      const s = getPracticeState();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(s);
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

  const handleStartPractice = (task: PracticeTask) => {
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

  if (!state) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <h2>Loading your practice plan...</h2>
        </div>
      </div>
    );
  }

  const completedCount = state.completedTaskIds.length;
  const totalCount = state.tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const totalMinutes = state.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

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
        <div className={styles.header}>
          <h1 className={styles.title}>Daily Practice Plan</h1>
          <p className={styles.subtitle}>{todayStr} • {totalMinutes} minutes total</p>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <h2>Today&apos;s Progress</h2>
            <span>{completedCount} of {totalCount} completed</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className={styles.taskList}>
          {state.tasks.map(task => {
            const isCompleted = state.completedTaskIds.includes(task.id);
            const dimensionName = DIMENSION_LABELS[task.dimension] || task.dimension;
            const reason = task.dimension === 'general' 
              ? 'Core preparation and warmup'
              : `Targeted practice to improve your ${dimensionName}`;

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
                      Why: {reason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
