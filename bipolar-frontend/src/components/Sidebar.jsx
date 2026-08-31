import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, BookHeart, TrendingUp, Settings, Brain, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mood-logs", label: "Mood Logs", icon: BookHeart },
  { to: "/forecast", label: "Forecast", icon: TrendingUp },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const handleNavClick = () => {
    // Auto-close drawer on mobile on click
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="sidebar-backdrop"
          />
        )}
      </AnimatePresence>

      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: "256px",
          backgroundColor: "#1e2235",
          color: "#b0b5c9",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transform: window.innerWidth <= 768 && !isOpen ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isOpen ? "4px 0 24px rgba(0,0,0,0.3)" : "none"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "12px",
              background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Brain style={{ width: "20px", height: "20px", color: "white" }} />
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>Bipolar AI</h1>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
              display: window.innerWidth <= 768 ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "0 12px", marginTop: "8px" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                style={{ textDecoration: "none", display: "block", marginBottom: "4px" }}
              >
                <motion.div
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px", borderRadius: "12px", fontSize: "14px", fontWeight: 500,
                    color: isActive ? "white" : "#8b90a5",
                    backgroundColor: isActive ? "#8b5cf6" : "transparent",
                    transition: "background-color 0.2s"
                  }}
                  whileHover={{ x: 4, backgroundColor: isActive ? "#8b5cf6" : "#2a2f47" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon style={{ width: "20px", height: "20px" }} />
                  {item.label}
                </motion.div>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: "0 16px 24px" }}>
          <div style={{
            borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", padding: "16px"
          }}>
            <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>Daily Check-in</p>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "white", marginTop: "4px", fontFamily: "'Space Grotesk', sans-serif" }}>How are you feeling?</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
