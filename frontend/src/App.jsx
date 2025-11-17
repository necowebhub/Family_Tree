import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicPage from "./pages/PublicPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PublicPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<PublicPage />} />
            </Routes>
        </BrowserRouter>
    );
}
