import {
  Bell,
  ChevronDown,
  UserCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { useProject } from "../../context/projectContext.jsx";

const Topbar = ({ title = "Dashboard" }) => {
  const { currentUser } = useAuth();
  const { projectState } = useProject();

  const projectName =
    projectState?.selectedProject?.name ||
    "Refinery Expansion Project";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <p className="topbar-label">CURRENT PAGE</p>
          <h1 className="topbar-title">{title}</h1>
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="project-selector"
          aria-label="Select project"
        >
          <div className="project-selector-text">
            <span className="project-selector-label">
              PROJECT
            </span>

            <span className="project-selector-name">
              {projectName}
            </span>
          </div>

          <ChevronDown size={16} />
        </button>

        <div className="last-updated">
          <span className="last-updated-label">
            LAST UPDATED
          </span>

          <span className="last-updated-time">
            Today, 10:30 AM
          </span>
        </div>

        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">
          <UserCircle size={34} />

          <div className="user-profile-text">
            <strong>
              {currentUser?.name || "User"}
            </strong>

            <span>
              {currentUser?.role || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;