import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../dashboard/components/DashboardLayout.jsx';
import { createComplaint, getCategories } from '../service/api.js';
import { ArrowLeft, AlertCircle, Check } from '../../common/Icons.jsx';
import { Spinner } from '../../common/LoadingSkeleton.jsx';

const NewComplaint = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);
  const [serverError, setServerError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'MEDIUM',
  });
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    categoryId: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
        setServerError('Unable to load categories. Please check your network connection.');
      } finally {
        setFetchingCats(false);
      }
    };
    fetchCategories();
  }, []);

  // Validation rules
  const errors = {
    title: !form.title.trim()
      ? 'Complaint title is required'
      : form.title.trim().length < 3
      ? 'Title must be at least 3 characters long'
      : form.title.trim().length > 150
      ? 'Title cannot exceed 150 characters'
      : '',
    categoryId: !form.categoryId ? 'Please select a valid category' : '',
    description: !form.description.trim()
      ? 'Detailed description is required'
      : form.description.trim().length < 10
      ? 'Description must be at least 10 characters long'
      : '',
  };

  const isFormValid = !errors.title && !errors.categoryId && !errors.description;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, description: true, categoryId: true });
    setServerError('');

    if (!isFormValid) {
      return;
    }

    setLoading(true);
    try {
      await createComplaint(form);
      navigate('/customer/complaints');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to submit complaint. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    {
      val: 'LOW',
      label: 'Low',
      desc: 'Minor issue / non-blocking',
      activeClass: 'border-emerald-500 bg-emerald-50/60 text-emerald-900 ring-2 ring-emerald-500/20',
      dotClass: 'bg-emerald-500',
    },
    {
      val: 'MEDIUM',
      label: 'Medium',
      desc: 'Standard support issue',
      activeClass: 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20',
      dotClass: 'bg-amber-500',
    },
    {
      val: 'HIGH',
      label: 'High',
      desc: 'Major service interruption',
      activeClass: 'border-orange-500 bg-orange-50/60 text-orange-900 ring-2 ring-orange-500/20',
      dotClass: 'bg-orange-500',
    },
    {
      val: 'CRITICAL',
      label: 'Critical',
      desc: 'Total stoppage / outage',
      activeClass: 'border-rose-500 bg-rose-50/60 text-rose-900 ring-2 ring-rose-500/20',
      dotClass: 'bg-rose-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header & Back navigation */}
        <div>
          <Link
            to="/customer/complaints"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Complaints</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            File a New Complaint
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Please fill in the details of the issue you experienced. Our support team will investigate and update you.
          </p>
        </div>

        {serverError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 leading-snug">{serverError}</div>
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
        >
          {/* Complaint Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="title"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Complaint Title <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  form.title.length > 130 ? 'text-rose-600 font-medium' : 'text-slate-400'
                }`}
              >
                {form.title.length}/150
              </span>
            </div>
            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              onBlur={() => handleBlur('title')}
              placeholder="e.g. Overheating issue during fast charging"
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                touched.title && errors.title
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
              }`}
            />
            {touched.title && errors.title && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <span>✕</span> {errors.title}
              </p>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label
              htmlFor="categoryId"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              onBlur={() => handleBlur('categoryId')}
              disabled={fetchingCats}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors cursor-pointer ${
                touched.categoryId && errors.categoryId
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
              }`}
            >
              <option value="">
                {fetchingCats ? 'Loading categories...' : 'Select a relevant category'}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {touched.categoryId && errors.categoryId && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <span>✕</span> {errors.categoryId}
              </p>
            )}
          </div>

          {/* Severity / Priority Card Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Severity / Priority
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {priorities.map((p) => {
                const isSelected = form.priority === p.val;
                return (
                  <button
                    type="button"
                    key={p.val}
                    onClick={() => setForm({ ...form, priority: p.val })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? p.activeClass
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-semibold text-xs">
                        <span className={`w-2 h-2 rounded-full ${p.dotClass}`} />
                        <span>{p.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-current shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="description"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  form.description.length < 10 ? 'text-slate-400' : 'text-emerald-600 font-medium'
                }`}
              >
                {form.description.length} chars (min 10)
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              rows={5}
              placeholder="Please provide steps to reproduce, hardware/account identifiers, or specific details of what happened..."
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors resize-y ${
                touched.description && errors.description
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
              }`}
            />
            {touched.description && errors.description && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <span>✕</span> {errors.description}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/customer/complaints')}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (touched.title && !isFormValid)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Spinner size="sm" className="text-white" />}
              <span>{loading ? 'Submitting...' : 'Submit Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewComplaint;
