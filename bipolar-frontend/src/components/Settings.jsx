import { motion } from "framer-motion";
import { useState } from "react";
import { User, Bell, Shield, Save } from "lucide-react";

const Toggle = ({ checked, onChange }) => (
  <button onClick={() => onChange(!checked)} style={{
    width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", position: "relative",
    background: checked ? "linear-gradient(135deg, #8b5cf6, #a855f7)" : "#e5e7eb", transition: "background 0.2s"
  }}>
    <div style={{
      width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "white",
      position: "absolute", top: "2px", left: "2px",
      transform: checked ? "translateX(20px)" : "translateX(0)", transition: "transform 0.2s"
    }} />
  </button>
);

const Settings = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      if (onUpdateUser) {
        onUpdateUser({ ...user, username: name, email: email });
      }
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 600);
  };

  const inputStyle = {
    width: "100%", backgroundColor: "#f3f4f6", borderRadius: "12px", padding: "10px 16px",
    fontSize: "14px", border: "none", outline: "none"
  };

  return (
    <>
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "32px", fontFamily: "'Space Grotesk', sans-serif" }}>
        Settings
      </motion.h1>

      <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={16} color="white" />
            </div>
            <h3 style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>Profile</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "14px", color: "#6b7280", display: "block", marginBottom: "4px" }}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "14px", color: "#6b7280", display: "block", marginBottom: "4px" }}>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={16} color="white" />
            </div>
            <h3 style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>Notifications</h3>
          </div>
          {[
            { label: "Push Notifications", desc: "Receive alerts on your device", checked: notifications, onChange: setNotifications },
            { label: "Daily Mood Reminder", desc: "Reminder to log your mood each day", checked: dailyReminder, onChange: setDailyReminder },
            { label: "Weekly Report", desc: "Get a summary every Sunday", checked: weeklyReport, onChange: setWeeklyReport },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>{item.label}</p>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>{item.desc}</p>
              </div>
              <Toggle checked={item.checked} onChange={item.onChange} />
            </div>
          ))}
        </motion.div>

        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg, #10b981, #14b8a6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} color="white" />
            </div>
            <h3 style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>Privacy & Data</h3>
          </div>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>Your mental health data is encrypted and stored securely. Only you can access it.</p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "14px", backgroundColor: "transparent", cursor: "pointer" }}>Export Data</button>
            <button style={{ padding: "8px 16px", border: "1px solid #fca5a5", borderRadius: "12px", fontSize: "14px", color: "#ef4444", backgroundColor: "transparent", cursor: "pointer" }}>Delete All Data</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ display: "flex", justifyContent: "flex-end" }}>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "white",
              borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: 500,
              border: "none", cursor: isSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px",
              opacity: isSaving ? 0.7 : 1
            }}>
            <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default Settings;
