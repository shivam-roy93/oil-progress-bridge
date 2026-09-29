import {
  createContext,
  useContext,
  useState,
} from "react";

import { users } from "../data/mockData";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "progressBridgeAuth";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

      return savedAuth ? JSON.parse(savedAuth) : null;
    } catch (error) {
      console.error(
        "Failed to load authentication state:",
        error
      );

      return null;
    }
  });

  const isAuthenticated = Boolean(currentUser);

  const role = currentUser?.roleKey || null;

  const login = (email, password, roleKey) => {
    const user = users.find(
      (item) =>
        item.email.toLowerCase() ===
          email.trim().toLowerCase() &&
        item.password === password &&
        item.roleKey === roleKey
    );

    if (!user) {
      return {
        success: false,
        message:
          "Invalid email, password, or selected role.",
      };
    }

    setCurrentUser(user);

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(user)
    );

    return {
      success: true,
      user,
    };
  };

  const logout = () => {
    setCurrentUser(null);

    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = {
    currentUser,
    role,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};