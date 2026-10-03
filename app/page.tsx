import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.section}>
          <div className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Your next interview deserves a better answer.
              </h1>
              <p className={styles.heroDescription}>
                Practice real interview conversations, get honest AI feedback, and turn every answer into progress.
              </p>
              <div className={styles.heroButtons}>
                <Link href="/interview/setup" className={styles.btnPrimary}>
                  Start a Mock Interview
                </Link>
                <Link href="/interview/history" className={styles.btnSecondary}>
                  View Interview History
                </Link>
              </div>
            </div>
            
            {/* Expressive visual using CSS shapes */}
            <div className={styles.heroVisual}>
              <div className={styles.shapeCircle}></div>
              
              <div className={styles.floatingCard} style={{ top: '15%', left: '0', width: '220px' }}>
                <div className={styles.cardBadge}>AI Feedback</div>
                <div className={styles.cardLine}></div>
                <div className={styles.cardLine}></div>
                <div className={styles.cardLine}></div>
              </div>

              <div className={styles.floatingCard} style={{ bottom: '15%', right: '5%', width: '260px', animationDelay: '1.5s' }}>
                <div className={styles.cardBadge} style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>95/100 Score</div>
                <div className={styles.cardLine}></div>
                <div className={styles.cardLine}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust / Value Strip */}
        <section className={styles.trustStrip}>
          Practice smarter. Speak clearer. Walk in prepared.
        </section>

        {/* Features Section */}
        <section id="features" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Everything you need to succeed</h2>
            <p className={styles.sectionSubtitle}>Designed to build your confidence and refine your answers.</p>
          </div>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <h3 className={styles.featureTitle}>Realistic Mock Interviews</h3>
              <p className={styles.featureDesc}>Experience lifelike conversations that mimic the flow and pressure of a real interview.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </div>
              <h3 className={styles.featureTitle}>Personalized AI Feedback</h3>
              <p className={styles.featureDesc}>Get actionable, honest feedback on your tone, clarity, and the substance of your answers.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <h3 className={styles.featureTitle}>Adaptive Follow-up Questions</h3>
              <p className={styles.featureDesc}>The AI listens to your responses and asks intelligent follow-ups to test your depth of knowledge.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <h3 className={styles.featureTitle}>Progress Tracking</h3>
              <p className={styles.featureDesc}>Watch your performance metrics improve over time as you practice and refine your pitch.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>Four simple steps to your next job offer.</p>
          </div>
          
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Choose your role</h3>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Practice your interview</h3>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Get feedback</h3>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>4</div>
              <h3 className={styles.stepTitle}>Improve</h3>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="for-you" className={styles.section}>
          <div className={styles.ctaSection}>
            <h2 className={styles.ctaTitle}>Your next opportunity starts with one practice session.</h2>
            <Link href="/interview/setup" className={styles.btnPrimary}>
              Start Practicing
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
