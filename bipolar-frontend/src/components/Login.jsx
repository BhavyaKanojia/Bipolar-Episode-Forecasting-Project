import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Brain, ArrowRight, UserPlus } from "lucide-react";
import { API_BASE_URL } from "../config";

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const endpoint = isLogin ? "/api/login" : "/api/register";

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (data.success) {
        if (isLogin) {
          onLogin(data);
        } else {
          setSuccess("Account created successfully! Logging you in...");
          setTimeout(() => onLogin(data), 1000);
        }
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Network error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #1f2937, #111827)", color: "white", padding: "20px",
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(145deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))",
          backdropFilter: "blur(12px)", borderRadius: "24px", padding: "48px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          width: "100%", maxWidth: "420px", textAlign: "center"
        }}
      >
        <motion.div 
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
          style={{
            width: "80px", height: "80px", borderRadius: "20px", margin: "0 auto 24px",
            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.5)"
          }}
        >
          <Brain size={40} color="white" />
        </motion.div>

        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "32px", fontSize: "15px" }}>
          {isLogin ? "Log in to track your mood forecasting" : "Join us and start forecasting your mood"}
        </p>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ 
                background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", 
                borderRadius: "12px", marginBottom: "24px", fontSize: "14px", border: "1px solid rgba(239,68,68,0.2)",
                overflow: "hidden"
              }}>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ 
                background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "12px", 
                borderRadius: "12px", marginBottom: "24px", fontSize: "14px", border: "1px solid rgba(16,185,129,0.2)",
                overflow: "hidden"
              }}>
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <User size={20} color="#9ca3af" style={{ position: "absolute", left: "16px" }} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%", padding: "16px 16px 16px 48px", borderRadius: "12px", border: "none",
                  background: "rgba(0,0,0,0.2)", color: "white", fontSize: "15px",
                  outline: "none", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                }}
                required
              />
            </div>
          </div>
          <div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock size={20} color="#9ca3af" style={{ position: "absolute", left: "16px" }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "16px 16px 16px 48px", borderRadius: "12px", border: "none",
                  background: "rgba(0,0,0,0.2)", color: "white", fontSize: "15px",
                  outline: "none", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                }}
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              width: "100%", padding: "16px", borderRadius: "12px", border: "none",
              background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "white",
              fontSize: "16px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "8px",
              boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)", opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")} 
            {isLogin ? <ArrowRight size={18} /> : <UserPlus size={18} />}
          </motion.button>
        </form>

        <div style={{ marginTop: "24px" }}>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
              style={{
                background: "none", border: "none", color: "#8b5cf6", fontWeight: "bold", 
                cursor: "pointer", fontFamily: "inherit", fontSize: "14px", padding: 0
              }}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
