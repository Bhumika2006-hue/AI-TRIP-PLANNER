import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

// Components
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";
import TripPlanner from "@/components/TripPlanner";
import ChatBot from "@/components/ChatBot";
import AdminDashboard from "@/components/AdminDashboard";
import SharedTrip from "@/components/SharedTrip";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    setShowAuth(false);
    toast.success('Welcome back!');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            user ? <Navigate to="/dashboard" /> : <LandingPage onAuthClick={() => setShowAuth(true)} />
          } />
          <Route path="/dashboard" element={
            user ? <Dashboard user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/" />
          } />
          <Route path="/plan" element={
            user ? <TripPlanner user={user} token={token} /> : <Navigate to="/" />
          } />
          <Route path="/chat" element={
            user ? <ChatBot user={user} token={token} /> : <Navigate to="/" />
          } />
          <Route path="/admin" element={
            user && user.is_admin ? <AdminDashboard user={user} token={token} /> : <Navigate to="/" />
          } />
          <Route path="/shared/:shareToken" element={<SharedTrip />} />
        </Routes>
      </BrowserRouter>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleLogin} />}
    </div>
  );
}

export default App;