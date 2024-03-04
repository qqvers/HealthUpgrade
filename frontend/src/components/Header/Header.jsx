import HeaderItems from "../HeaderItems/HeaderItems";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.mainHeader}>
      <h1>Health Upgrade</h1>
      <HeaderItems />
    </header>
  );
}
