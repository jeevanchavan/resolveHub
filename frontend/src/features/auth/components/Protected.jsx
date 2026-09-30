import { Navigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth.js';

export const Protected = ({ children, role, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-3 shadow-md shadow-indigo-500/20 animate-pulse">
          <span className="font-bold text-sm">RH</span>
        </div>
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified (supports case-insensitive check like "customer", "CUSTOMER", etc.)
  const requiredRoles = allowedRoles || (role ? [role.toUpperCase(), role.toLowerCase(), role] : null);
  if (requiredRoles && !requiredRoles.includes(user.role) && !requiredRoles.includes(user.role?.toLowerCase())) {
    const dashboardMap = {
      CUSTOMER: '/customer/dashboard',
      AGENT: '/agent/dashboard',
      ADMIN: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  return children;
};

export default Protected;
