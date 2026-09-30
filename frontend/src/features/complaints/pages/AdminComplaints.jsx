import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../dashboard/components/DashboardLayout.jsx';
import ComplaintFilterBar from '../components/ComplaintFilterBar.jsx';
import { getAllComplaints } from '../service/api.js';
import { StatusBadge, PriorityBadge } from '../../common/Badge.jsx';
import { EmptyState } from '../../common/EmptyState.jsx';
import { TableSkeleton } from '../../common/LoadingSkeleton.jsx';
import { Ticket } from '../../common/Icons.jsx';

const AdminComplaints = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const initialFilters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    categoryId: searchParams.get('categoryId') || '',
    assignedAgentId: searchParams.get('assignedAgentId') || '',
    dateRange: searchParams.get('dateRange') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  };

  const [filters, setFilters] = useState(initialFilters);

  const fetchComplaints = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.assignedAgentId) params.assignedAgentId = filters.assignedAgentId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await getAllComplaints(params);
      setComplaints(data.complaints || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1);
    const q = {};
    if (filters.search) q.search = filters.search;
    if (filters.status) q.status = filters.status;
    if (filters.priority) q.priority = filters.priority;
    if (filters.categoryId) q.categoryId = filters.categoryId;
    if (filters.assignedAgentId) q.assignedAgentId = filters.assignedAgentId;
    if (filters.dateRange) q.dateRange = filters.dateRange;
    setSearchParams(q, { replace: true });
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      categoryId: '',
      assignedAgentId: '',
      dateRange: '',
      startDate: '',
      endDate: '',
    });
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-2 border-b border-slate-200/80">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Complaints Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter, assign, and oversee all customer complaints across the organization.
          </p>
        </div>

        {/* Filter Bar with Agent filter */}
        <ComplaintFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          showAgentFilter={true}
          totalResults={pagination.total}
        />

        {/* Complaints Table Card */}
        {loading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No complaints found"
            description="There are no complaints matching your current filter and search criteria."
            actionLabel="Clear all filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">Title</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Agent</th>
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => navigate(`/admin/complaints/${c._id}`)}
                      className="hover:bg-slate-50/75 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60 group-hover:border-indigo-200 transition-colors">
                          {c.complaintId}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900 group-hover:text-indigo-600 transition-colors max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {c.categoryId?.name || 'General'}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {c.customerId?.name || c.customerId?.username || '—'}
                      </td>
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        {c.assignedAgentId ? (
                          <span className="font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md text-xs border border-indigo-200/60">
                            {c.assignedAgentId.name}
                          </span>
                        ) : (
                          <Link
                            to={`/admin/complaints/${c._id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                          >
                            <span>+ Assign</span>
                          </Link>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={c.priority} size="sm" />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Showing page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
                  <span className="font-semibold text-slate-700">{pagination.pages}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => fetchComplaints(p)}
                      className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        p === pagination.page
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminComplaints;
