import React from "react";
import styles from "./FooterItems.module.css";

const FooterItems = () => {
  return (
    <ul className={styles.footerItems}>
      <li>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
      </li>
      <li>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
      </li>
    </ul>
  );
};

export default FooterItems;
