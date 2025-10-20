import React from "react";
import styles from "./Footer.module.css";

export default function Footer({ html }) {
    return <footer className={styles.footer} dangerouslySetInnerHTML={{__html: html}} />;
}
