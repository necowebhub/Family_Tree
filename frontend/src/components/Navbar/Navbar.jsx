import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import styles from "./Navbar.module.css";

export default function Navbar({ isAdmin=false, onLogout }) {
    const scrollTo = (target) => {
        if (isAdmin) {
            window.location.href = "/#" + target;
        } else {
            scroller.scrollTo(target, {
                smooth: true,
                duration: 600,
                offset: -80,
            });
        }
    };

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.left}>
                    <span className={styles.link} onClick={() => scrollTo("top")}>Главная</span>
                    <span className={styles.link} onClick={() => scrollTo("about")}>Обо мне</span>
                    <span className={styles.link} onClick={() => scrollTo("contacts")}>Контакты</span>
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
