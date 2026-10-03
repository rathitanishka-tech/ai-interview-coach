"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./setup.module.css";

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", 
  "Software Engineer", "Data Analyst", "Product Manager", 
  "UI/UX Designer", "Other"
];

const EXPERIENCES = ["Fresher", "0–1 Years", "1–3 Years", "3–5 Years", "5+ Years"];

const TYPES = ["Technical", "HR", "Behavioral", "Mixed"];

const DIFFICULTIES = [
  { level: "Easy", desc: "Basic concepts and fundamental principles." },
  { level: "Medium", desc: "Standard industry questions and problem-solving." },
  { level: "Hard", desc: "Complex scenarios and deep technical discussions." }
];

const QUESTIONS = [5, 10, 15];

export default function SetupPage() {
  const router = useRouter();
  
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState<number | "">("");
  
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!role || !experience || !type || !difficulty || !questions) {
      setError("Please complete all selections before continuing.");
      return;
    }
    setError("");
    
    const config = { role, experience, type, difficulty, questions };
    try {
      sessionStorage.setItem("interviewConfig", JSON.stringify(config));
    } catch (e) {
      console.warn("Failed to save to sessionStorage", e);
    }
    
    router.push("/interview/session");
  };

  const estimatedDuration = typeof questions === "number" ? questions * 2 : 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <div className={styles.brand}>AI Interview Coach</div>
        </div>
        <div className={styles.headerContent}>
          <div className={styles.step}>Step 1 of 2</div>
          <h1 className={styles.heading}>Let&apos;s set up your interview.</h1>
          <p className={styles.supportingText}>A few details will help us tailor your practice session.</p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.configSection}>
          <div className={styles.configCard}>
            
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Target Role</h2>
              <div className={styles.gridCards}>
                {ROLES.map(r => (
                  <button 
                    key={r} 
                    className={`${styles.selectCard} ${role === r ? styles.active : ""}`}
                    onClick={() => setRole(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Experience Level</h2>
              <div className={styles.flexCards}>
                {EXPERIENCES.map(e => (
                  <button 
                    key={e} 
                    className={`${styles.selectCard} ${experience === e ? styles.active : ""}`}
                    onClick={() => setExperience(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Interview Type</h2>
              <div className={styles.flexCards}>
                {TYPES.map(t => (
                  <button 
                    key={t} 
                    className={`${styles.selectCard} ${type === t ? styles.active : ""}`}
                    onClick={() => setType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Difficulty</h2>
              <div className={styles.gridCardsCol1}>
                {DIFFICULTIES.map(d => (
                  <button 
                    key={d.level} 
                    className={`${styles.selectCard} ${styles.alignLeft} ${difficulty === d.level ? styles.active : ""}`}
                    onClick={() => setDifficulty(d.level)}
                  >
                    <div className={styles.diffLevel}>{d.level}</div>
                    <div className={styles.diffDesc}>{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Number of Questions</h2>
              <div className={styles.flexCards}>
                {QUESTIONS.map(q => (
                  <button 
                    key={q} 
                    className={`${styles.selectCard} ${questions === q ? styles.active : ""}`}
                    onClick={() => setQuestions(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Session Summary</h2>
            <ul className={styles.summaryList}>
              <li>
                <span className={styles.summaryLabel}>Role:</span>
                <span className={styles.summaryValue}>{role || "—"}</span>
              </li>
              <li>
                <span className={styles.summaryLabel}>Experience:</span>
                <span className={styles.summaryValue}>{experience || "—"}</span>
              </li>
              <li>
                <span className={styles.summaryLabel}>Type:</span>
                <span className={styles.summaryValue}>{type || "—"}</span>
              </li>
              <li>
                <span className={styles.summaryLabel}>Difficulty:</span>
                <span className={styles.summaryValue}>{difficulty || "—"}</span>
              </li>
              <li>
                <span className={styles.summaryLabel}>Questions:</span>
                <span className={styles.summaryValue}>{questions || "—"}</span>
              </li>
            </ul>
            
            <div className={styles.duration}>
              Estimated Duration: <strong>{estimatedDuration > 0 ? `~${estimatedDuration} mins` : "—"}</strong>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button className={styles.btnPrimary} onClick={handleContinue}>
              Continue to Interview
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
