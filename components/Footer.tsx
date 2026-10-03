import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>AI Interview Coach</div>
        <div className={styles.copy}>
          &copy; {new Date().getFullYear()} AI Interview Coach. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
