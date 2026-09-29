import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { currentUser, isAuthenticated } = useAuth();

  // User is not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but has the wrong role
  if (allowedRole && currentUser?.roleKey !== allowedRole) {
    const roleRedirects = {
      "site-supervisor": "/site-supervisor",
      "planning-engineer": "/planning-engineer",
      "project-manager": "/project-manager",
    };

    return (
      <Navigate
        to={
          roleRedirects[currentUser?.roleKey] ||
          "/login"
        }
        replace
      />
    );
  }

  // User is authenticated and has permission
  return children;
};

export default ProtectedRoute;