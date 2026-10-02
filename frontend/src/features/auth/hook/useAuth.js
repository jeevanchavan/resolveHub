import { useContext } from "react";
import { AuthContext } from "../state/authContext.jsx";
import { login, register, logout, getMe } from "../service/api.js";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response?.token) {
        localStorage.setItem('token', response.token);
      }
      if (response?.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      setUser(response?.user || null);
      return response?.user;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await register(name, email, password);
      if (response?.token) {
        localStorage.setItem('token', response.token);
      }
      if (response?.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      setUser(response?.user || null);
      return response?.user;
    } finally {
      setLoading(false);
    }
  };

  const handleGetMe = async () => {
    setLoading(true);
    try {
      const response = await getMe();
      if (response?.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      }
      return response?.user || null;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout().catch(() => {});
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
  };

  return {
    user,
    setUser,
    loading,
    setLoading,
    // Support both function naming conventions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    getMe: handleGetMe,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGetMe,
  };
};

export default useAuth;
