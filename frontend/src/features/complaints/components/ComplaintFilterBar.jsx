import { useState, useEffect } from 'react';
import { getCategories, getAgents } from '../service/api.js';
import { Search, X, Filter, RefreshCw } from '../../common/Icons.jsx';

const ComplaintFilterBar = ({
  filters,
  onFilterChange,
  onReset,
  showAgentFilter = false,
  totalResults = 0,
}) => {
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories || []))
      .catch((err) => console.error('Failed to load categories', err));

    if (showAgentFilter) {
      getAgents()
        .then((res) => setAgents(res.agents || []))
        .catch((err) => console.error('Failed to load agents', err));
    }
  }, [showAgentFilter]);

  // Keep search input synced with prop
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onFilterChange({ ...filters, search: '' });
  };

  const handleDateQuickSelect = (range) => {
    let startDate = '';
    let endDate = '';
    const now = new Date();

    if (range === 'TODAY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate = today.toISOString().split('T')[0];
    } else if (range === 'LAST_7_DAYS') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      startDate = past.toISOString().split('T')[0];
    } else if (range === 'LAST_30_DAYS') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      startDate = past.toISOString().split('T')[0];
    }

    onFilterChange({ ...filters, dateRange: range, startDate, endDate });
  };

  const activeCount = [
    filters.search,
    filters.status,
    filters.priority,
    filters.categoryId,
    filters.assignedAgentId,
    filters.dateRange,
  ].filter(Boolean).length;

  const selectBaseClass =
    'px-3 py-2 bg-white border rounded-lg text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer';

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs mb-6 space-y-4">
      {/* Top Search Row */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by ID (e.g. CMP-0001), Title, Description, or Customer..."
            className="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              title="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
        >
          Search
        </button>
      </form>

      {/* Filter Dropdowns & Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className={`${selectBaseClass} ${
              filters.status ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-200'
            }`}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open (New)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REOPENED">Reopened</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || ''}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
            className={`${selectBaseClass} ${
              filters.priority ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-200'
            }`}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="CRITICAL">Critical Priority</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.categoryId || ''}
            onChange={(e) => onFilterChange({ ...filters, categoryId: e.target.value })}
            className={`${selectBaseClass} ${
              filters.categoryId ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-200'
            }`}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Agent Filter (Admin only) */}
          {showAgentFilter && (
            <select
              value={filters.assignedAgentId || ''}
              onChange={(e) => onFilterChange({ ...filters, assignedAgentId: e.target.value })}
              className={`${selectBaseClass} ${
                filters.assignedAgentId ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-200'
              }`}
            >
              <option value="">All Agents</option>
              <option value="UNASSIGNED">Unassigned Only</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
          )}

          {/* Date Range Filter */}
          <select
            value={filters.dateRange || ''}
            onChange={(e) => handleDateQuickSelect(e.target.value)}
            className={`${selectBaseClass} ${
              filters.dateRange ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-200'
            }`}
          >
            <option value="">All Time</option>
            <option value="TODAY">Today</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
          </select>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center justify-between lg:justify-end gap-3 text-xs">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset filters ({activeCount})</span>
            </button>
          )}

          <span className="text-slate-500 font-medium">
            <span className="text-slate-900 font-semibold">{totalResults}</span>{' '}
            {totalResults === 1 ? 'complaint' : 'complaints'} found
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComplaintFilterBar;
