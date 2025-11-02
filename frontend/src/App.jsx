import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicPage from "./pages/PublicPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/404";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<PublicPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<PublicPage />} />
        </Routes>
    );
}
