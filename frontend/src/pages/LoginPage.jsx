import React, { useState } from "react";
import { login, resetPassword } from "../api";

export default function LoginPage() {
    const [authState, setAuthState] = useState({ email: "", password: "" });
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    async function onLogin() {
        try {
        await login(authState.email, authState.password);
        navigate("/", { replace: true });
        } catch (e) {
        alert("Ошибка входа: " + e.message);
        }
    }

    async function onResetPassword() {
        try {
        await resetPassword(resetEmail);
        alert("Письмо для сброса пароля отправлено");
        setShowReset(false);
        } catch (e) {
        alert("Ошибка: " + e.message);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Вход</h2>

                {!showReset ? (
                    <>
                    <label>
                        Почта
                        <br />
                        <input
                        value={authState.email}
                        onChange={(e) =>
                            setAuthState({ ...authState, email: e.target.value })
                        }
                        />
                    </label>
                    <br />
                    <label>
                        Пароль
                        <br />
                        <input
                        type="password"
                        value={authState.password}
                        onChange={(e) =>
                            setAuthState({ ...authState, password: e.target.value })
                        }
                        />
                    </label>
                    <br />
                    <button onClick={onLogin}>Войти</button>
                    <br />
                    <button
                        onClick={() => setShowReset(true)}
                        style={{
                        background: "none",
                        border: "none",
                        color: "#555",
                        cursor: "pointer",
                        marginTop: 10,
                        }}
                    >
                        Забыли пароль?
                    </button>
                    </>
                ) : (
                    <>
                    <h3>Восстановление пароля</h3>
                    <br />

                    <input
                        placeholder="Почта"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <br />

                    <button onClick={onResetPassword}>Отправить письмо</button>
                    <br />
                    <button onClick={() => setShowReset(false)}>Назад</button>
                    </>
                )}
            </div>
        </div>    
    );
}
