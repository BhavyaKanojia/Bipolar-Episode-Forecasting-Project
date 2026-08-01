import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, HeartPulse, Shield, TrendingUp, Sparkles } from "lucide-react";

export default function Welcome() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "white", fontFamily: "'Space Grotesk', sans-serif", overflow: "hidden" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 48px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={24} color="white" />
          </div>
          <span style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "-0.5px" }}>Bipolar AI</span>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link to="/login" style={{ padding: "10px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", color: "white", textDecoration: "none", fontWeight: 600, transition: "all 0.2s" }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}>
            Login
          </Link>
          <Link to="/login" style={{ padding: "10px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "white", textDecoration: "none", fontWeight: 600, boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)" }}>
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Decorative Background Elements */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)", zIndex: 0 }} />

      {/* Hero Section */}
      <div style={{ padding: "120px 24px 80px", textAlign: "center", maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "20px", background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", color: "#c4b5fd", fontSize: "14px", fontWeight: 600, marginBottom: "32px" }}
        >
          <Sparkles size={16} /> Welcome to the future of mental health
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: "64px", fontWeight: "bold", lineHeight: 1.1, marginBottom: "24px", letterSpacing: "-1px" }}
        >
          Forecasting mental health with <br/>
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Precision AI</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: "20px", color: "#94a3b8", marginBottom: "48px", lineHeight: 1.6, maxWidth: "700px", margin: "0 auto 48px" }}
        >
          Log your daily moods, track your sleep, and let our advanced machine learning models predict and prevent potential bipolar episodes before they happen.
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <Link to="/login" style={{ 
            display: "inline-block", padding: "18px 48px", borderRadius: "16px", 
            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "white", 
            textDecoration: "none", fontSize: "18px", fontWeight: "bold", 
            boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.5)",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-4px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}>
            Start Your Journey
          </Link>
        </motion.div>
      </div>

      {/* Features */}
      <div style={{ display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap", padding: "48px 24px 100px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        {[
          { icon: <TrendingUp size={32} color="#a78bfa" />, title: "Predictive Analytics", desc: "Our ML model predicts mania and depression risk with incredible accuracy." },
          { icon: <HeartPulse size={32} color="#f472b6" />, title: "Mood Tracking", desc: "Beautiful and intuitive daily logs to track your mood, energy, and sleep." },
          { icon: <Shield size={32} color="#34d399" />, title: "Private & Secure", desc: "Your sensitive health data is encrypted and completely private." }
        ].map((feat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 + (i * 0.1) }}
            whileHover={{ y: -10 }}
            style={{ 
              background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(10px)",
              padding: "40px 32px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", 
              width: "100%", maxWidth: "340px", textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
            }}
          >
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: "1px solid rgba(255,255,255,0.05)" }}>
              {feat.icon}
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", color: "white" }}>{feat.title}</h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
