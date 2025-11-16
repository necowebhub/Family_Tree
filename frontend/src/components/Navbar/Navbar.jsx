import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import styles from "./Navbar.module.css";

export default function Navbar({ isAdmin=false, onLogout }) {
    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.left}>
                    <ScrollLink className={styles.link} to="top" smooth={true} duration={600} offset={-80}>Главная</ScrollLink>
                    <ScrollLink className={styles.link} to="about" smooth={true} duration={600} offset={-80}>Обо мне</ScrollLink>
                    <ScrollLink className={styles.link} to="contacts" smooth={true} duration={600} offset={-80}>Контакты</ScrollLink>
                </div>
                <div className={styles.right}>
                    {isAdmin ? (
                        <button className={styles.button} onClick={onLogout}>Выйти</button>
                    ) : (
                        <RouterLink className={styles.button} to="/admin">Войти</RouterLink>
                    )}
                </div>
            </nav>
        </header>
    );
}
