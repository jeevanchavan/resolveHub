import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Register from '../features/auth/pages/Register.jsx';
import Login from '../features/auth/pages/Login.jsx';
import Protected from '../features/auth/components/Protected.jsx';
import CustomerDashboard from '../features/dashboard/pages/CustomerDashboard.jsx';
import AgentDashboard from '../features/dashboard/pages/AgentDashboard.jsx';
import AdminDashboard from '../features/dashboard/pages/AdminDashboard.jsx';
import MyComplaints from '../features/complaints/pages/MyComplaints.jsx';
import NewComplaint from '../features/complaints/pages/NewComplaint.jsx';
import ComplaintDetail from '../features/complaints/pages/ComplaintDetail.jsx';
import AdminComplaints from '../features/complaints/pages/AdminComplaints.jsx';
import AgentComplaints from '../features/complaints/pages/AgentComplaints.jsx';
import { useAuth } from '../features/auth/hook/useAuth.js';

// Home component - routes logged-in users to their role dashboard, or /login if guest
export const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-3 shadow-md shadow-indigo-500/20 animate-pulse">
          <span className="font-bold text-sm">RH</span>
        </div>
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Loading ResolveHub...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const dashboardMap = {
    CUSTOMER: '/customer/dashboard',
    AGENT: '/agent/dashboard',
    ADMIN: '/admin/dashboard',
  };

  return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
};

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/customer',
    children: [
      {
        path: '/customer/dashboard',
        element: (
          <Protected role="customer">
            <CustomerDashboard />
          </Protected>
        ),
      },
      {
        path: '/customer/complaints',
        element: (
          <Protected role="customer">
            <MyComplaints />
          </Protected>
        ),
      },
      {
        path: '/customer/complaints/new',
        element: (
          <Protected role="customer">
            <NewComplaint />
          </Protected>
        ),
      },
      {
        path: '/customer/complaints/:id',
        element: (
          <Protected role="customer">
            <ComplaintDetail />
          </Protected>
        ),
      },
    ],
  },
  {
    path: '/agent',
    children: [
      {
        path: '/agent/dashboard',
        element: (
          <Protected role="agent">
            <AgentDashboard />
          </Protected>
        ),
      },
      {
        path: '/agent/complaints',
        element: (
          <Protected role="agent">
            <AgentComplaints />
          </Protected>
        ),
      },
      {
        path: '/agent/complaints/:id',
        element: (
          <Protected role="agent">
            <ComplaintDetail />
          </Protected>
        ),
      },
    ],
  },
  {
    path: '/admin',
    children: [
      {
        path: '/admin/dashboard',
        element: (
          <Protected role="admin">
            <AdminDashboard />
          </Protected>
        ),
      },
      {
        path: '/admin/complaints',
        element: (
          <Protected role="admin">
            <AdminComplaints />
          </Protected>
        ),
      },
      {
        path: '/admin/complaints/:id',
        element: (
          <Protected role="admin">
            <ComplaintDetail />
          </Protected>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default routes;
