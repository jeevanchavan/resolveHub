import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth.js';
import { Shield, ArrowRight, AlertCircle } from '../../common/Icons.jsx';
import { Spinner } from '../../common/LoadingSkeleton.jsx';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation
  const errors = {
    name: !name.trim()
      ? 'Full name is required'
      : name.trim().length < 2
      ? 'Name must be at least 2 characters'
      : '',
    email: !email.trim()
      ? 'Email is required'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Please enter a valid email address'
      : '',
    password: !password
      ? 'Password is required'
      : password.length < 6
      ? 'Password must be at least 6 characters'
      : '',
    confirm: !confirmPassword
      ? 'Please confirm your password'
      : confirmPassword !== password
      ? 'Passwords do not match'
      : '',
  };

  const isFormValid = !errors.name && !errors.email && !errors.password && !errors.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    setServerError('');

    if (!isFormValid) {
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/customer/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
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
          Create your account
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Get started with ResolveHub customer complaint portal
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200/90 shadow-xs rounded-2xl">
          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 leading-snug">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched({ ...touched, name: true })}
                placeholder="e.g. John Doe"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  touched.name && errors.name
                    ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
              />
              {touched.name && errors.name && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <span>✕</span> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                placeholder="name@example.com"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  touched.email && errors.email
                    ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
              />
              {touched.email && errors.email && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <span>✕</span> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                placeholder="Minimum 6 characters"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  touched.password && errors.password
                    ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
              />
              {touched.password && errors.password && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <span>✕</span> {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, confirm: true })}
                placeholder="Re-type your password"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  touched.confirm && errors.confirm
                    ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
              />
              {touched.confirm && errors.confirm && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <span>✕</span> {errors.confirm}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Spinner size="sm" className="text-white" />}
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
              >
                Sign In
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
