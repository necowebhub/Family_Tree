import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div>
            <h1>404 - Страница не найдена</h1>
            <Link to="/">Вернуться на главную</Link>
        </div>
    );
}