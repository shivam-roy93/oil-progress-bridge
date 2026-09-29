import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import ProtectedRoute from "./ProtectedRoute";

/* =========================================================
   SITE SUPERVISOR
========================================================= */

import SiteSupervisorDashboard from "../pages/site-supervisor/SiteSupervisorDashboard";
import CaptureProgress from "../pages/site-supervisor/CaptureProgress";
import MyActivities from "../pages/site-supervisor/MyActivities";
import MyReports, {
  ReportDetails,
} from "../pages/site-supervisor/MyReports";

/* =========================================================
   PLANNING ENGINEER
========================================================= */

import PlanningEngineerDashboard from "../pages/planning-engineer/PlanningEngineerDashboard";
import ImportSchedule from "../pages/planning-engineer/ImportSchedule";
import PlanningSchedule from "../pages/planning-engineer/PlanningSchedule";
import ProgressDelay from "../pages/planning-engineer/ProgressDelay";
import ReviewFieldMatches from "../pages/planning-engineer/ReviewFieldMatches";

/* =========================================================
   PROJECT MANAGER
========================================================= */

import ProjectManagerDashboard from "../pages/project-manager/ProjectManagerDashboard";
import ProjectManagerProgress from "../pages/project-manager/ProjectManagerProgress";
import ProjectManagerSchedule from "../pages/project-manager/ProjectManagerSchedule";
import ProjectManagerDelays from "../pages/project-manager/ProjectManagerDelays";

/* =========================================================
   APP ROUTES
========================================================= */

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            ROOT
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        {/* =================================================
            SITE SUPERVISOR
        ================================================= */}

        <Route
          path="/site-supervisor"
          element={
            <ProtectedRoute
              allowedRole="site-supervisor"
            >
              <SiteSupervisorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/site-supervisor/capture"
          element={
            <ProtectedRoute
              allowedRole="site-supervisor"
            >
              <CaptureProgress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/site-supervisor/activities"
          element={
            <ProtectedRoute
              allowedRole="site-supervisor"
            >
              <MyActivities />
            </ProtectedRoute>
          }
        />

        <Route
          path="/site-supervisor/reports"
          element={
            <ProtectedRoute
              allowedRole="site-supervisor"
            >
              <MyReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/site-supervisor/reports/:id"
          element={
            <ProtectedRoute
              allowedRole="site-supervisor"
            >
              <ReportDetails />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PLANNING ENGINEER
        ================================================= */}

        <Route
          path="/planning/dashboard"
          element={
            <ProtectedRoute
              allowedRole="planning-engineer"
            >
              <PlanningEngineerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Old Planning Engineer URL */}
        <Route
          path="/planning-engineer"
          element={
            <Navigate
              to="/planning/dashboard"
              replace
            />
          }
        />

        {/* Import Schedule */}
        <Route
          path="/planning/import"
          element={
            <ProtectedRoute
              allowedRole="planning-engineer"
            >
              <ImportSchedule />
            </ProtectedRoute>
          }
        />

        {/* Schedule */}
        <Route
          path="/planning/schedule"
          element={
            <ProtectedRoute
              allowedRole="planning-engineer"
            >
              <PlanningSchedule />
            </ProtectedRoute>
          }
        />

        {/* Progress & Delay */}
        <Route
          path="/planning/progress-delay"
          element={
            <ProtectedRoute
              allowedRole="planning-engineer"
            >
              <ProgressDelay />
            </ProtectedRoute>
          }
        />

        {/* Review Field Matches */}
        <Route
          path="/planning/review"
          element={
            <ProtectedRoute
              allowedRole="planning-engineer"
            >
              <ReviewFieldMatches />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROJECT MANAGER
        ================================================= */}

        {/* Dashboard */}
        <Route
          path="/pm/dashboard"
          element={
            <ProtectedRoute
              allowedRole="project-manager"
            >
              <ProjectManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Progress */}
        <Route
          path="/pm/progress"
          element={
            <ProtectedRoute
              allowedRole="project-manager"
            >
              <ProjectManagerProgress />
            </ProtectedRoute>
          }
        />

        {/* Schedule */}
        <Route
          path="/pm/schedule"
          element={
            <ProtectedRoute
              allowedRole="project-manager"
            >
              <ProjectManagerSchedule />
            </ProtectedRoute>
          }
        />

        {/* Delays */}
        <Route
          path="/pm/delays"
          element={
            <ProtectedRoute
              allowedRole="project-manager"
            >
              <ProjectManagerDelays />
            </ProtectedRoute>
          }
        />

        {/* /pm → Dashboard */}
        <Route
          path="/pm"
          element={
            <Navigate
              to="/pm/dashboard"
              replace
            />
          }
        />

        {/* Old Project Manager URL */}
        <Route
          path="/project-manager"
          element={
            <Navigate
              to="/pm/dashboard"
              replace
            />
          }
        />

        {/* =================================================
            UNKNOWN ROUTE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;