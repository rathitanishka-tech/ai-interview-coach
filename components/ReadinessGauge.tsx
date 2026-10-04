"use client";

import React, { useEffect, useState } from 'react';
import styles from './ReadinessGauge.module.css';
import { ReadinessData } from '@/lib/interview/analytics';

export function ReadinessGauge({ readiness }: { readiness: ReadinessData }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Add small delay to trigger the CSS transition
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!readiness || readiness.status === 'Insufficient Data' || readiness.score === null) {
    return (
      <div className={styles.container}>
        <h2 className={styles.statusText} style={{ color: 'var(--color-text-secondary)' }}>
          Readiness Score Unavailable
        </h2>
        <p className={styles.explanation}>
          {readiness?.explanation || "Complete at least 5 evaluated questions to generate your Readiness Score."}
        </p>
        <div className={styles.clusterCount}>
          Evaluated Clusters: {readiness?.clusterCount || 0} / 5
        </div>
      </div>
    );
  }

  const radius = 68; // slightly larger for 160px box
  const circumference = 2 * Math.PI * radius;
  const offset = mounted ? circumference - (readiness.score / 100) * circumference : circumference;

  let colorClass = styles.needsPractice;
  let statusColor = '#ef4444';
  if (readiness.status === 'Interview Ready') {
    colorClass = styles.ready;
    statusColor = '#10b981';
  } else if (readiness.status === 'Approaching Readiness') {
    colorClass = styles.approaching;
    statusColor = '#f59e0b';
  }

  return (
    <div className={styles.container} role="region" aria-label="Interview Readiness Score">
      <div className={styles.gaugeContainer}>
        <svg className={styles.gaugeSvg} viewBox="0 0 160 160" aria-hidden="true">
          <circle 
            className={styles.gaugeBackground}
            cx="80" cy="80" r={radius} 
          />
          <circle 
            className={`${styles.gaugeProgress} ${colorClass}`}
            cx="80" cy="80" r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className={styles.gaugeText}>
          <span className={styles.scoreValue}>{readiness.score}</span>
          <span className={styles.scoreLabel}>Score</span>
        </div>
      </div>

      <h2 className={styles.statusText} style={{ color: statusColor }}>
        {readiness.status}
      </h2>
      <p className={styles.explanation}>{readiness.explanation}</p>

      <div className={styles.breakdownGrid}>
        <div className={styles.breakdownItem}>
          <span className={styles.breakdownLabel}>Core Skills ({Math.round(readiness.breakdown.baseScore)}/70)</span>
          <div className={styles.breakdownBarContainer}>
            <div 
              className={styles.breakdownBar} 
              style={{ width: mounted ? `${(readiness.breakdown.baseScore / 70) * 100}%` : '0%' }}
            />
          </div>
        </div>
        <div className={styles.breakdownItem}>
          <span className={styles.breakdownLabel}>Consistency ({Math.round(readiness.breakdown.consistency)}/15)</span>
          <div className={styles.breakdownBarContainer}>
            <div 
              className={styles.breakdownBar} 
              style={{ width: mounted ? `${(readiness.breakdown.consistency / 15) * 100}%` : '0%' }}
            />
          </div>
        </div>
        <div className={styles.breakdownItem}>
          <span className={styles.breakdownLabel}>Difficulty ({Math.round(readiness.breakdown.difficulty)}/15)</span>
          <div className={styles.breakdownBarContainer}>
            <div 
              className={styles.breakdownBar} 
              style={{ width: mounted ? `${(readiness.breakdown.difficulty / 15) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      <div className={styles.clusterCount}>
        Based on {readiness.clusterCount} evaluated question topics
      </div>
    </div>
  );
}
