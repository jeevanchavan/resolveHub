import { createContext, useEffect, useState } from "react";
import { getMe } from "../service/api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount (reads HttpOnly cookie via /api/auth/me)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await getMe();
        if (response && response.user) {
          setUser(response.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
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
