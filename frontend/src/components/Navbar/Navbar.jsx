import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar({ onLogout, onChangePass }) {
    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.left}>
                    <Link className={styles.linkButton} to="/">
                        Редактировать
                    </Link>
                </div>

                <div className={styles.right}>
                    <button
                        className={styles.button}
                        onClick={onChangePass}
                        style={{ marginRight: 10 }}
                    >
                        Сменить пароль
                    </button>

                    <button
                        className={styles.button}
                        onClick={onLogout}
                    >
                        Выйти
                    </button>
                </div>
            </nav>
        </header>
    );
}
