import React, { useState } from "react";
import { login, resetPassword } from "../api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [authState, setAuthState] = useState({ email: "", password: "" });
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    const navigate = useNavigate();

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
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                onLogin();
                            }}
                        >
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
                            <button className="auth-btn" type="submit">Войти</button>
                        </form>

                        <button
                            onClick={() => setShowReset(true)}
                            className="auth-btn secondary"
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
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                onResetPassword();
                            }}
                        >
                            <input
                                placeholder="Почта"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                            <br />

                            <button className="auth-btn" type="submit">Отправить письмо</button>
                            <br />
                            <button className="auth-btn secondary" type="button" onClick={() => setShowReset(false)}>Назад</button>
                        </form>
                    </>
                )}
            </div>
        </div>    
    );
}
