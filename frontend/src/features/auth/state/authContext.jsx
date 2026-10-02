import { createContext, useEffect, useState } from "react";
import { getMe } from "../service/api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user immediately from localStorage to prevent flash/redirect on refresh
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    // If we have a saved token, start with loading true while we verify in background
    return !!localStorage.getItem('token');
  });

  // Verify and refresh session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await getMe();
        if (response && response.user) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
