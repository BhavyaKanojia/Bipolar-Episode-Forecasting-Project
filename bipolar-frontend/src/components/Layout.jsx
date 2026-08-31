import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main-wrapper">
        <Topbar
          user={user}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
