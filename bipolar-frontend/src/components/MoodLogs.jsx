import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Smile, Meh, Frown, Zap, Moon } from "lucide-react";
import { API_BASE_URL } from "../config";

const moodIcons = [Frown, Meh, Smile];
const moodLabels = ["Low", "Neutral", "Good"];
const moodColors = ["#ef4444", "#6b7280", "#14b8a6"];
const moodGradients = [
  "linear-gradient(135deg, #8b5cf6, #a855f7)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
];

const MoodLogs = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newMood, setNewMood] = useState(1);
  const [newEnergy, setNewEnergy] = useState(5);
  const [newSleep, setNewSleep] = useState(7);
  const [newNotes, setNewNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      let url = `${API_BASE_URL}/api/logs`;
      if (user && user.user_id) url += `?user_id=${user.user_id}`;
      const res = await fetch(url);
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSave = async () => {
    const payload = {
      user_id: user?.user_id || 1,
      date: new Date().toISOString().split("T")[0],
      mood: newMood,
      energy: newEnergy,
      sleep: newSleep,
      notes: newNotes,
    };

    try {
      await fetch(`${API_BASE_URL}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setShowForm(false);
      setNewNotes("");
      fetchLogs(); // refresh latest
    } catch (err) {
      console.error("Failed to save log", err);
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: "30px", fontWeight: "bold", fontFamily: "'Space Grotesk', sans-serif" }}>
          Mood Logs
        </motion.h1>
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "white",
            borderRadius: "12px", padding: "10px 20px", fontSize: "14px", fontWeight: 500,
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
          }}>
          <Plus size={16} /> Log Mood
        </motion.button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)", marginBottom: "32px" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "16px", fontFamily: "'Space Grotesk', sans-serif" }}>New Entry</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "14px", color: "#6b7280", display: "block", marginBottom: "8px" }}>Mood</label>
              <div style={{ display: "flex", gap: "12px" }}>
                {moodIcons.map((Icon, i) => (
                  <button key={i} onClick={() => setNewMood(i)} style={{
                    width: "48px", height: "48px", borderRadius: "12px", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: newMood === i ? "linear-gradient(135deg, #8b5cf6, #a855f7)" : "#f3f4f6",
                    color: newMood === i ? "white" : "#6b7280",
                    transform: newMood === i ? "scale(1.1)" : "scale(1)", transition: "all 0.2s"
                  }}>
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "14px", color: "#6b7280", display: "block", marginBottom: "8px" }}>Energy (1-10)</label>
              <input type="range" min={1} max={10} value={newEnergy} onChange={(e) => setNewEnergy(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#8b5cf6" }} />
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>{newEnergy}/10</span>
            </div>
            <div>
              <label style={{ fontSize: "14px", color: "#6b7280", display: "block", marginBottom: "8px" }}>Sleep (hrs)</label>
              <input type="range" min={0} max={12} step={0.5} value={newSleep} onChange={(e) => setNewSleep(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#14b8a6" }} />
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>{newSleep} hrs</span>
            </div>
          </div>
          <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
            placeholder="How are you feeling? Any triggers or highlights?"
            style={{
              width: "100%", backgroundColor: "#f3f4f6", borderRadius: "12px", padding: "16px",
              fontSize: "14px", border: "none", resize: "none", height: "80px", outline: "none"
            }} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", gap: "12px" }}>
            <button onClick={() => setShowForm(false)} style={{
              padding: "8px 16px", fontSize: "14px", border: "none", borderRadius: "12px",
              backgroundColor: "transparent", cursor: "pointer", color: "#6b7280"
            }}>Cancel</button>
            <button onClick={handleSave} style={{
              background: "linear-gradient(135deg, #10b981, #14b8a6)", color: "white",
              borderRadius: "12px", padding: "8px 20px", fontSize: "14px", fontWeight: 500,
              border: "none", cursor: "pointer"
            }}>Save Entry</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>Loading...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}>
          <p style={{ color: "#6b7280", fontSize: "16px", fontFamily: "'Space Grotesk'" }}>No logs found. Add your first entry!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {entries.map((entry, i) => {
          const MoodIcon = moodIcons[entry.mood];
          return (
            <motion.div key={entry.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} whileHover={{ x: 4 }}
              style={{
                backgroundColor: "white", borderRadius: "16px", padding: "20px",
                boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)", display: "flex",
                alignItems: "center", gap: "20px", cursor: "pointer"
              }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: moodGradients[entry.mood], display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <MoodIcon size={20} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{entry.date}</span>
                  <span style={{ fontSize: "12px", fontWeight: 500, color: moodColors[entry.mood] }}>{moodLabels[entry.mood]}</span>
                </div>
                <p style={{ fontSize: "14px", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.notes}</p>
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#9ca3af", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Zap size={14} /> {entry.energy}/10</div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Moon size={14} /> {entry.sleep}h</div>
              </div>
            </motion.div>
          );
        })}
        </div>
      )}
    </>
  );
};

export default MoodLogs;
