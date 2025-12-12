import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { scroller } from "react-scroll";
import styles from "./Navbar.module.css";

export default function Navbar({ isAdmin=false, onLogout, onChangePass }) {
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
                    <button className={styles.linkButton} onClick={() => scrollTo("top")}>Главная</button>
                    <button className={styles.linkButton} onClick={() => scrollTo("about")}>Обо мне</button>
                    <button className={styles.linkButton} onClick={() => scrollTo("contacts")}>Контакты</button>
                </div>
                <div className={styles.right}>
                    {isAdmin ? (
                        <>
                            <button className={styles.button} onClick={onChangePass} style={{ marginRight: 10 }} >Сменить пароль</button>
                            <button className={styles.button} onClick={onLogout} >Выйти</button>
                        </>
                    ) : (
                        <RouterLink className={styles.button} to="/admin">Войти</RouterLink>
                    )}
                </div>
            </nav>
        </header>
    );
}
