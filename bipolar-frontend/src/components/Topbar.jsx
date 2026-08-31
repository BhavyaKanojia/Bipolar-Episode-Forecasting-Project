import { User, LogOut, LogIn, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Topbar = ({ user, onLogout, onToggleSidebar }) => {
  const navigate = useNavigate();
  
  return (
    <header className="topbar-header">
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Hamburger Menu Button on Mobile */}
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>

        <h2 className="topbar-title" style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937", fontFamily: "'Space Grotesk', sans-serif" }}>
          Mental Health Monitoring
        </h2>
      </div>
      
      <div>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#4b5563" }}>
              Hi, <strong style={{ color: "#8b5cf6" }}>{user.username}</strong>
            </span>
            <button 
              onClick={onLogout}
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px",
                borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444",
                border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
            >
              <LogOut size={14} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate("/login")}
            style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
              borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
              boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"
            }}
          >
            <LogIn size={14} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
