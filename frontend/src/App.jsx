import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import LibraryPage from "@/pages/LibraryPage";
import ReaderPage from "@/pages/ReaderPage";
import SettingsPage from "@/pages/SettingsPage";
import { Toaster } from "@/components/ui/sonner";

import { api } from "@/lib/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="flex items-center justify-center h-screen bg-[#FDFBF5]">Loading...</div>;
    return user ? children : <Navigate to="/auth" />;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-[#FDFBF5]">Loading...</div>;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/library" /> : <LandingPage />} />
          <Route path="/auth" element={user ? <Navigate to="/library" /> : <AuthPage setUser={setUser} />} />
          <Route path="/library" element={<ProtectedRoute><LibraryPage user={user} setUser={setUser} /></ProtectedRoute>} />
          <Route path="/reader/:bookId" element={<ProtectedRoute><ReaderPage user={user} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage user={user} setUser={setUser} /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
