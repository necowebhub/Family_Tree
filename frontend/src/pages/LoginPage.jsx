import React, { useState } from "react";
import { login, resetPassword } from "../api";

export default function LoginPage() {
  const [authState, setAuthState] = useState({ email: "", password: "" });
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  async function onLogin() {
    try {
      await login(authState.email, authState.password);
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
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>Вход</h2>

      {!showReset ? (
        <>
          <label>
            Почта
            <input
              value={authState.email}
              onChange={(e) =>
                setAuthState({ ...authState, email: e.target.value })
              }
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              value={authState.password}
              onChange={(e) =>
                setAuthState({ ...authState, password: e.target.value })
              }
            />
          </label>

          <button onClick={onLogin}>Войти</button>

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

          <input
            placeholder="Почта"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />

          <button onClick={onResetPassword}>Отправить письмо</button>
          <button onClick={() => setShowReset(false)}>Назад</button>
        </>
      )}
    </div>
  );
}
