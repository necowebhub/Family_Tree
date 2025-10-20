import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar({ isAdmin=false, onLogout }) {
    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.left}>
                    <Link className={styles.link} to="/">Главная</Link>
                    <Link className={styles.link} to="/">Обо мне</Link>
                    <Link className={styles.link} to="/">Контакты</Link>
                </div>
                <div className={styles.right}>
                    {isAdmin ? (
                        <button className={styles.button} onClick={onLogout}>Выйти</button>
                    ) : (
                        <Link className={styles.button} to="/admin">Войти</Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
