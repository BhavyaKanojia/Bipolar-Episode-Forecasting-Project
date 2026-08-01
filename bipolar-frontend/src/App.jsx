import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MoodLogs from "./components/MoodLogs";
import ForecastExplorer from "./components/ForecastExplorer";
import Settings from "./components/Settings";
import ChatArea from "./components/ChatArea";
import Welcome from "./components/Welcome";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("bipolar_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("bipolar_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("bipolar_user");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Full screen login intercept */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        
        <Route path="/welcome" element={user ? <Navigate to="/" /> : <Welcome />} />
        
        {/* Main Application Shell Access */}
        <Route path="/*" element={
          user ? (
            <Layout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/mood-logs" element={<MoodLogs user={user} />} />
                <Route path="/forecast" element={<ForecastExplorer user={user} />} />
                <Route path="/chat" element={<ChatArea user={user} />} />
                <Route path="/settings" element={<Settings onLogout={handleLogout} user={user} onUpdateUser={handleLogin} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/welcome" />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
