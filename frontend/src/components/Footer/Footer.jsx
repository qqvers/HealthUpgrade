import React from "react";
import FooterItems from "../FooterItems/FooterItems";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerContent}>
        <FooterItems />
        <div className={styles.footerContact}>
          <p>Telefon: +48 123 456 789</p>
          <p>Email: contact@example.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
