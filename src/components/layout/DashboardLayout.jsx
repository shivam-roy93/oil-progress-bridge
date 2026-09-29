import { useState } from "react";
import { Menu } from "lucide-react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({
  children,
  title = "Dashboard",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">

      {/* Mobile menu button */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      {/* Main application area */}
      <div className="dashboard-main">

        <Topbar title={title} />

        <main className="dashboard-content">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;