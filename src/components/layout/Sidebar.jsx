import {
  Activity,
  BarChart3,
  ClipboardCheck,
  FileSpreadsheet,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  UserCircle,
  Upload,
  Wifi,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const Sidebar = ({
  isOpen = true,
  onClose,
}) => {
  const {
    currentUser,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const role =
    currentUser?.roleKey;

  /* =======================================================
     ROLE BASED NAVIGATION
  ======================================================= */

  const getNavItems = () => {

    /* =====================================================
       SITE SUPERVISOR
    ===================================================== */

    if (
      role ===
      "site-supervisor"
    ) {
      return [
        {
          label: "Dashboard",
          path: "/site-supervisor",
          icon: LayoutDashboard,
        },

        {
          label: "Capture Progress",
          path: "/site-supervisor/capture",
          icon: ClipboardCheck,
        },

        {
          label: "My Activities",
          path: "/site-supervisor/activities",
          icon: FolderKanban,
        },

        {
          label: "My Reports",
          path: "/site-supervisor/reports",
          icon: BarChart3,
        },
      ];
    }

    /* =====================================================
       PLANNING ENGINEER
    ===================================================== */

    if (
      role ===
      "planning-engineer"
    ) {
      return [
        {
          label: "Dashboard",
          path: "/planning/dashboard",
          icon: LayoutDashboard,
        },

        {
          label: "Import Schedule",
          path: "/planning/import",
          icon: Upload,
        },

        {
          label: "Schedule",
          path: "/planning/schedule",
          icon: FileSpreadsheet,
        },

        {
          label: "Progress & Delay",
          path: "/planning/progress-delay",
          icon: BarChart3,
        },

        {
          label: "Review Field Matches",
          path: "/planning/review",
          icon: ClipboardCheck,
        },
      ];
    }

    /* =====================================================
       PROJECT MANAGER
    ===================================================== */

    if (
      role ===
      "project-manager"
    ) {
      return [
        {
          label: "Dashboard",
          path: "/pm/dashboard",
          icon: LayoutDashboard,
        },

        {
          label: "Progress",
          path: "/pm/progress",
          icon: BarChart3,
        },

        {
          label: "Schedule",
          path: "/pm/schedule",
          icon: FileSpreadsheet,
        },

        {
          label: "Delays",
          path: "/pm/delays",
          icon: ClipboardCheck,
        },
      ];
    }

    return [];
  };

  const navItems =
    getNavItems();

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );

    onClose?.();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <aside
      className={`sidebar ${
        isOpen
          ? "sidebar-open"
          : "sidebar-closed"
      }`}
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="sidebar-header">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            <LayoutDashboard
              size={21}
            />
          </div>

          <div className="sidebar-brand-text">

            <strong>
              PROGRESS BRIDGE
            </strong>

            <span>
              Planning-to-Execution
            </span>

          </div>

        </div>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={19} />
        </button>

      </div>

      {/* ===================================================
          ACTIVE PROJECT
      =================================================== */}

      <div className="sidebar-project">

        <span className="sidebar-project-label">
          ACTIVE PROJECT
        </span>

        <strong>
          Refinery Expansion
        </strong>

        <span>
          Package 2
        </span>

      </div>

      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <nav
        className="sidebar-nav"
        aria-label="Main navigation"
      >

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        {navItems.map(
          (item) => {
            const Icon =
              item.icon;

            const isRootRoute =
              item.path ===
                "/site-supervisor" ||
              item.path ===
                "/planning/dashboard" ||
              item.path ===
                "/pm/dashboard";

            return (
              <NavLink
                key={
                  item.path
                }
                to={
                  item.path
                }
                end={
                  isRootRoute
                }
                className={({
                  isActive,
                }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "sidebar-nav-item-active"
                      : ""
                  }`
                }
                onClick={() =>
                  onClose?.()
                }
              >

                <Icon
                  size={18}
                />

                <span>
                  {
                    item.label
                  }
                </span>

              </NavLink>
            );
          }
        )}

      </nav>

      {/* ===================================================
          SPACER
      =================================================== */}

      <div className="sidebar-spacer"></div>

      {/* ===================================================
          SYSTEM STATUS
      =================================================== */}

      <div className="sidebar-status">

        <div className="sidebar-status-icon">

          <Wifi
            size={16}
          />

        </div>

        <div>

          <span>
            System Status
          </span>

          <strong>
            Online
          </strong>

        </div>

      </div>

      {/* ===================================================
          USER
      =================================================== */}

      <div className="sidebar-user">

        <UserCircle
          size={34}
        />

        <div className="sidebar-user-info">

          <strong>
            {
              currentUser?.name ||
              "User"
            }
          </strong>

          <span>
            {
              currentUser?.role ||
              "User"
            }
          </span>

        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={
            handleLogout
          }
          aria-label="Logout"
          title="Logout"
        >

          <LogOut
            size={17}
          />

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;