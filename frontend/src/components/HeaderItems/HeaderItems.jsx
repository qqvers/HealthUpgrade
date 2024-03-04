import React from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../Context/LoginContext";
import styles from "./HeaderItems.module.css";

export default function HeaderItems() {
  const { isLoggedIn, logout } = useLogin();

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        {isLoggedIn ? (
          <>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/bmi-calculator">
                BMI Calculator
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/calorie-calculator">
                Calorie Calculator
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/schedule-planner">
                Schedule Planner
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/meal-planner">
                Meal Planner
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/verified-sources">
                Verified Sources
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/login" onClick={logout}>
                Logout
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/login">
                Login
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link className={styles.navLink} to="/signup">
                Sign up
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
