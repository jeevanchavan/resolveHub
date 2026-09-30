import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth.js';
import { Shield, ArrowRight, AlertCircle } from '../../common/Icons.jsx';
import { Spinner } from '../../common/LoadingSkeleton.jsx';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (loginId, loginPassword) => {
    if (!loginId.trim() || !loginPassword) {
      setError('Please provide both email/username and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await login(loginId.trim(), loginPassword);
      const dashboardMap = {
        CUSTOMER: '/customer/dashboard',
        AGENT: '/agent/dashboard',
        ADMIN: '/admin/dashboard',
      };
      navigate(dashboardMap[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(identifier, password);
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setIdentifier(demoEmail);
    setPassword(demoPassword);
    handleLogin(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to Resolve<span className="text-indigo-600">Hub</span>
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Modern enterprise complaint management & resolution platform
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200/90 shadow-xs rounded-2xl">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 leading-snug">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or username"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Spinner size="sm" className="text-white" />}
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
              >
                Create an account
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="mt-5 bg-white/80 border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Demo Accounts (1-Click)
            </span>
            <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
              Instant Access
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@resolvehub.com', 'admin123')}
              className="px-2.5 py-2 rounded-lg bg-purple-50 hover:bg-purple-100/80 text-purple-700 border border-purple-200 text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 group"
            >
              <span>Admin</span>
              <span className="text-[10px] text-purple-500 font-normal group-hover:text-purple-600">
                Full Control
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('amit@resolvehub.com', 'agent123')}
              className="px-2.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-200 text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 group"
            >
              <span>Agent</span>
              <span className="text-[10px] text-blue-500 font-normal group-hover:text-blue-600">
                Support Rep
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('rahul@example.com', 'customer123')}
              className="px-2.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 group"
            >
              <span>Customer</span>
              <span className="text-[10px] text-emerald-500 font-normal group-hover:text-emerald-600">
                Submit Issue
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
