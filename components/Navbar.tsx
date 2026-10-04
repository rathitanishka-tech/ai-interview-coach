import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          AI Interview Coach
        </Link>
        <div className={styles.links}>
          <Link href="#features" className={styles.link}>Features</Link>
          <Link href="#how-it-works" className={styles.link}>How It Works</Link>
          <Link href="/practice" className={styles.link}>Practice Plan</Link>
          <Link href="/interview/history" className={styles.link}>History</Link>
        </div>
        <Link href="/interview/setup" className={styles.btnPrimary}>
          Start Practicing
        </Link>
      </div>
    </nav>
  );
}
