import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, HeartPulse, Moon, Zap, Loader, Sparkles, RefreshCw, CheckCircle2, SunMedium, AlertCircle } from "lucide-react";
import MoodChart from "./Moodchart";
import { API_BASE_URL } from "../config";

const gradients = {
  purple: "linear-gradient(135deg, #8b5cf6, #a855f7)",
  orange: "linear-gradient(135deg, #f59e0b, #ef4444)",
  green: "linear-gradient(135deg, #10b981, #14b8a6)",
};

const StatCard = ({ title, value, gradient, delay = 0, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -4, scale: 1.02 }}
    style={{
      borderRadius: "16px", padding: "24px", color: "white", cursor: "pointer",
      background: gradient, minHeight: "140px", display: "flex", flexDirection: "column",
      justifyContent: "space-between", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.15)"
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <p style={{ fontSize: "14px", fontWeight: 500, opacity: 0.9 }}>{title}</p>
      {icon && <div style={{ opacity: 0.7 }}>{icon}</div>}
    </div>
    <p style={{ fontSize: "30px", fontWeight: "bold", marginTop: "8px", fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
  </motion.div>
);

const InfoCard = ({ title, value, color = "#8b5cf6", delay = 0, icon }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.03 }}
    style={{
      backgroundColor: "white", borderRadius: "16px", padding: "20px",
      boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)", cursor: "pointer"
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <p style={{ fontSize: "14px", fontWeight: 500, color: "#6b7280" }}>{title}</p>
      {icon && <div style={{ color: "#9ca3af" }}>{icon}</div>}
    </div>
    <p style={{ fontSize: "24px", fontWeight: "bold", marginTop: "8px", color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
  </motion.div>
);

const Dashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchDashboardData = () => {
    let url = `${API_BASE_URL}/api/dashboard`;
    if (user && user.user_id) url += `?user_id=${user.user_id}`;
    fetch(url)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchAiInsights = () => {
    setLoadingInsights(true);
    let url = `${API_BASE_URL}/api/ai/insights`;
    if (user && user.user_id) url += `?user_id=${user.user_id}`;
    fetch(url)
      .then(res => res.json())
      .then(d => {
        if (d && d.insights) {
          setAiInsights(d.insights);
        }
        setLoadingInsights(false);
      })
      .catch(err => {
        console.error("Failed to load AI insights:", err);
        setLoadingInsights(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (data && data.has_data) {
      fetchAiInsights();
    }
  }, [data?.has_data]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader className="animate-spin" size={48} color="#8b5cf6" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: "30px", fontWeight: "bold", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Dashboard & Forecasting
        </motion.h1>

        {data.has_data && (
          <button
            onClick={fetchAiInsights}
            disabled={loadingInsights}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)",
              color: "#8b5cf6", padding: "8px 16px", borderRadius: "12px",
              fontSize: "13.5px", fontWeight: 600, cursor: loadingInsights ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            <RefreshCw size={14} className={loadingInsights ? "animate-spin" : ""} />
            {loadingInsights ? "Generating Insights..." : "Refresh Groq AI Insights"}
          </button>
        )}
      </div>

      {!data.has_data ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            padding: "48px 32px", 
            backgroundColor: "white", 
            borderRadius: "16px", 
            textAlign: "center", 
            boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px"
          }}
        >
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
            <HeartPulse size={32} color="#8b5cf6" />
          </div>
          <h2 style={{ color: "#111827", fontSize: "24px", fontWeight: "bold", marginBottom: "16px", fontFamily: "'Space Grotesk', sans-serif" }}>Welcome to Bipolar AI</h2>
          <p style={{ color: "#6b7280", fontSize: "16px", maxWidth: "400px", lineHeight: "1.6" }}>
            Your dashboard will show personalized forecasts, mood stability metrics, and Groq-powered clinical insights once you start logging your daily data.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Top 3 Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
            <StatCard title="Mood Stability" value={data.mood_stability} gradient={gradients.purple} delay={0.1} icon={<Shield size={20} />} />
            <StatCard title="Mania Probability" value={`${data.mania_probability}%`} gradient={gradients.orange} delay={0.2} icon={<AlertTriangle size={20} />} />
            <StatCard title="Depression Risk" value={`${data.depression_risk}%`} gradient={gradients.green} delay={0.3} icon={<HeartPulse size={20} />} />
          </div>

          {/* AI Clinical Insights Banner (Powered by Groq) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "32px",
              boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              background: "linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(139,92,246,0.3)"
                }}>
                  <Sparkles size={18} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#111827", fontFamily: "'Space Grotesk', sans-serif" }}>
                    AI Clinical Insights & Coping Plan
                  </h3>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>Synthesized by Groq LLM from your longitudinal telemetry</span>
                </div>
              </div>

              {aiInsights?.risk_status && (
                <span style={{
                  fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px",
                  backgroundColor: aiInsights.risk_status === "High" ? "#fee2e2" : (aiInsights.risk_status === "Moderate" ? "#fef3c7" : "#d1fae5"),
                  color: aiInsights.risk_status === "High" ? "#b91c1c" : (aiInsights.risk_status === "Moderate" ? "#b45309" : "#047857"),
                }}>
                  Status: {aiInsights.risk_status}
                </span>
              )}
            </div>

            {loadingInsights ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px 0", color: "#8b5cf6" }}>
                <Loader className="animate-spin" size={20} />
                <span style={{ fontSize: "14px" }}>Groq AI is analyzing your sleep variance, mood swings, and risk probabilities...</span>
              </div>
            ) : aiInsights ? (
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#4c1d95", margin: "0 0 8px 0" }}>
                  {aiInsights.headline}
                </h4>
                <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, margin: "0 0 16px 0" }}>
                  {aiInsights.analysis}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "16px" }}>
                  {/* Early Warning Signals */}
                  {aiInsights.early_warning_signals && aiInsights.early_warning_signals.length > 0 && (
                    <div style={{ backgroundColor: "#fef2f2", padding: "14px 16px", borderRadius: "12px", border: "1px solid #fee2e2" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", color: "#991b1b", fontWeight: 600, fontSize: "13px" }}>
                        <AlertCircle size={15} /> Observed Prodromal Signals
                      </div>
                      <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#7f1d1d", lineHeight: 1.5 }}>
                        {aiInsights.early_warning_signals.map((sig, sIdx) => (
                          <li key={sIdx}>{sig}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actionable Coping Strategies */}
                  {aiInsights.coping_strategies && aiInsights.coping_strategies.length > 0 && (
                    <div style={{ backgroundColor: "#f0fdf4", padding: "14px 16px", borderRadius: "12px", border: "1px solid #dcfce7" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", color: "#166534", fontWeight: 600, fontSize: "13px" }}>
                        <CheckCircle2 size={15} /> Recommended Action Steps
                      </div>
                      <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#14532d", lineHeight: 1.5 }}>
                        {aiInsights.coping_strategies.map((strat, sIdx) => (
                          <li key={sIdx}>{strat}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Circadian Rhythm / Social Rhythm Therapy */}
                {aiInsights.circadian_advice && (
                  <div style={{
                    marginTop: "14px", padding: "10px 14px", borderRadius: "10px",
                    backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)",
                    display: "flex", alignItems: "center", gap: "10px", color: "#92400e", fontSize: "13px"
                  }}>
                    <SunMedium size={18} color="#d97706" style={{ flexShrink: 0 }} />
                    <span><strong>Circadian Anchor:</strong> {aiInsights.circadian_advice}</span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                {data.summary || "Click 'Refresh Groq AI Insights' to generate real-time clinical recommendations."}
              </p>
            )}
          </motion.div>
          
          {/* Main Grid: Mood Chart & Secondary Cards */}
          <div className="dashboard-main-grid">
            <div style={{ minWidth: 0, width: "100%" }}>
              <MoodChart data={data.chart_data || []} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
              <InfoCard title="Sleep Quality (Latest)" value={`${data.sleep_quality} hrs`} color="#14b8a6" delay={0.4} icon={<Moon size={16} />} />
              <InfoCard title="Next Episode Risk" value={data.next_episode_risk} color="#14b8a6" delay={0.5} icon={<Zap size={16} />} />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}
              >
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#6b7280" }}>ML Prediction Summary</p>
                <p style={{ fontSize: "14px", color: "#374151", marginTop: "8px", lineHeight: 1.6 }}>
                  {data.summary}
                </p>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
