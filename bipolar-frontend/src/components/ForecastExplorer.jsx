import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, AlertTriangle, Shield, Calendar, Loader } from "lucide-react";
import { API_BASE_URL } from "../config";

const cards = [
  { title: "7-Day Outlook", value: "Stable", icon: Shield, gradient: "linear-gradient(135deg, #10b981, #14b8a6)" },
  { title: "Risk Alert", value: "Low", icon: AlertTriangle, gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
  { title: "Confidence", value: "82%", icon: TrendingUp, gradient: "linear-gradient(135deg, #8b5cf6, #a855f7)" },
];

const ForecastExplorer = ({ user }) => {
  const [forecastData, setForecastData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hasEnoughData, setHasEnoughData] = useState(true);
  const [daysLogged, setDaysLogged] = useState(0);

  useEffect(() => {
    let url = `${API_BASE_URL}/api/forecast`;
    if (user && user.user_id) url += `?user_id=${user.user_id}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.has_enough_data === false) {
           setHasEnoughData(false);
           setDaysLogged(data.days_logged || 0);
        } else {
           setHasEnoughData(true);
           setForecastData(data.forecastData);
           setRiskData(data.riskData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader className="animate-spin" size={48} color="#8b5cf6" />
      </div>
    );
  }

  if (!hasEnoughData) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Shield size={64} color="#9ca3af" style={{ marginBottom: "16px" }} />
          <h2 style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "'Space Grotesk', sans-serif" }}>Gathering Data</h2>
          <p style={{ color: "#6b7280", marginTop: "8px", maxWidth: "400px" }}>
            We need at least 7 days of mood logs to safely run predictive forecasting models.
            <br/><br/>
            You have logged <strong>{daysLogged}</strong> / 7 days.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "32px", fontFamily: "'Space Grotesk', sans-serif" }}>
        Forecast
      </motion.h1>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "32px" }}>
      {cards.map((item, i) => (
        <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          style={{
            borderRadius: "16px", padding: "24px", color: "white",
            background: item.gradient, boxShadow: "0 4px 24px -4px rgba(0,0,0,0.15)"
          }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "14px", fontWeight: 500, opacity: 0.9 }}>{item.title}</p>
            <item.icon size={20} style={{ opacity: 0.7 }} />
          </div>
          <p style={{ fontSize: "30px", fontWeight: "bold", marginTop: "8px", fontFamily: "'Space Grotesk', sans-serif" }}>{item.value}</p>
        </motion.div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Space Grotesk', sans-serif" }}>
          <Calendar size={20} color="#8b5cf6" /> Predicted vs Actual
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
              <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} /><stop offset="100%" stopColor="#14b8a6" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 10]} />
            <Tooltip contentStyle={{ background: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.12)" }} />
            <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" fill="url(#predGrad)" strokeWidth={3} strokeDasharray="6 3" dot={{ r: 4 }} />
            <Area type="monotone" dataKey="actual" stroke="#14b8a6" fill="url(#actGrad)" strokeWidth={3} dot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "24px", fontFamily: "'Space Grotesk', sans-serif" }}>Episode Risk by Week</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip contentStyle={{ background: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.12)" }} />
            <Bar dataKey="mania" fill="#fb923c" radius={[8, 8, 0, 0]} />
            <Bar dataKey="depression" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  </>
  );
};

export default ForecastExplorer;
