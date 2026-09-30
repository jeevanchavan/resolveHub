import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { useAuth } from '../../auth/hook/useAuth.js';
import { getDashboardStats } from '../../complaints/service/api.js';
import { StatusBadge, PriorityBadge } from '../../common/Badge.jsx';
import { StatCard } from '../../common/StatCard.jsx';
import { EmptyState } from '../../common/EmptyState.jsx';
import { CardSkeleton, TableSkeleton } from '../../common/LoadingSkeleton.jsx';
import {
  Ticket,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Shield,
  Layers,
  ArrowRight,
  BarChart3,
} from '../../common/Icons.jsx';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    assigned: 0,
    inProgress: 0,
    escalated: 0,
    resolved: 0,
    closed: 0,
    pending: 0,
    unassigned: 0,
    byCategory: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await getDashboardStats();
        if (data.success && data.stats) {
          setStats(data.stats);
          setComplaints(data.recent || []);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const total = stats.total || 1;
  const openPct = Math.round(((stats.open || 0) / total) * 100);
  const assignedPct = Math.round(((stats.assigned || 0) / total) * 100);
  const inProgressPct = Math.round(((stats.inProgress || 0) / total) * 100);
  const escalatedPct = Math.round(((stats.escalated || 0) / total) * 100);
  const resolvedPct = Math.round((((stats.resolved || 0) + (stats.closed || 0)) / total) * 100);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const adminName = user?.name || user?.username || 'Administrator';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              <span>Executive Control</span>
              <span>&bull;</span>
              <span>System Operations</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {getGreeting()}, {adminName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              High-level overview of complaint throughput, agent distribution, and department workload.
            </p>
          </div>

          <Link
            to="/admin/complaints"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
          >
            <span>Manage All Complaints</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 KPI Metric Cards Grid */}
        {loading ? (
          <CardSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Total Complaints"
              value={stats.total}
              subtitle="View all"
              icon={Ticket}
              color="indigo"
              onClick={() => navigate('/admin/complaints')}
            />
            <StatCard
              title="Open (Unassigned)"
              value={stats.open}
              subtitle="Needs agent"
              icon={Clock}
              color="blue"
              onClick={() => navigate('/admin/complaints?status=OPEN')}
            />
            <StatCard
              title="In Handling"
              value={stats.pending}
              subtitle="Assigned / Active"
              icon={RefreshCw}
              color="amber"
              onClick={() => navigate('/admin/complaints?status=ASSIGNED')}
            />
            <StatCard
              title="Escalated"
              value={stats.escalated}
              subtitle="Urgent triage"
              icon={AlertTriangle}
              color="rose"
              onClick={() => navigate('/admin/complaints?status=ESCALATED')}
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              subtitle="Awaiting review"
              icon={CheckCircle2}
              color="emerald"
              onClick={() => navigate('/admin/complaints?status=RESOLVED')}
            />
            <StatCard
              title="Closed"
              value={stats.closed}
              subtitle="Completed"
              icon={ShieldCheck}
              color="slate"
              onClick={() => navigate('/admin/complaints?status=CLOSED')}
            />
          </div>
        )}

        {/* Visual Analytics Row: Status Overview Bar & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution Visual Card (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Complaint Status Distribution
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proportional breakdown of open versus resolved tickets
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {stats.total} Total
              </span>
            </div>

            {/* Segmented Distribution Progress Bar */}
            <div className="h-4 rounded-full bg-slate-100 flex overflow-hidden p-0.5 border border-slate-200/60 my-5 gap-0.5">
              {stats.open > 0 && (
                <div
                  style={{ width: `${openPct}%` }}
                  className="bg-sky-500 rounded-xs transition-all duration-500"
                  title={`Open: ${stats.open} (${openPct}%)`}
                />
              )}
              {stats.assigned > 0 && (
                <div
                  style={{ width: `${assignedPct}%` }}
                  className="bg-indigo-500 rounded-xs transition-all duration-500"
                  title={`Assigned: ${stats.assigned} (${assignedPct}%)`}
                />
              )}
              {stats.inProgress > 0 && (
                <div
                  style={{ width: `${inProgressPct}%` }}
                  className="bg-amber-500 rounded-xs transition-all duration-500"
                  title={`In Progress: ${stats.inProgress} (${inProgressPct}%)`}
                />
              )}
              {stats.escalated > 0 && (
                <div
                  style={{ width: `${escalatedPct}%` }}
                  className="bg-rose-500 rounded-xs transition-all duration-500"
                  title={`Escalated: ${stats.escalated} (${escalatedPct}%)`}
                />
              )}
              {stats.resolved > 0 && (
                <div
                  style={{ width: `${resolvedPct}%` }}
                  className="bg-emerald-500 rounded-xs transition-all duration-500"
                  title={`Resolved: ${stats.resolved} (${resolvedPct}%)`}
                />
              )}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                <span className="text-slate-600 truncate">Open:</span>
                <span className="font-bold text-slate-900 ml-auto">
                  {stats.open} <span className="text-slate-600 font-normal">({openPct}%)</span>
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-slate-600 truncate">Assigned:</span>
                <span className="font-bold text-slate-900 ml-auto">
                  {stats.assigned} <span className="text-slate-600 font-normal">({assignedPct}%)</span>
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-600 truncate">In Progress:</span>
                <span className="font-bold text-slate-900 ml-auto">
                  {stats.inProgress} <span className="text-slate-600 font-normal">({inProgressPct}%)</span>
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-slate-600 truncate">Escalated:</span>
                <span className="font-bold text-slate-900 ml-auto">
                  {stats.escalated} <span className="text-slate-600 font-normal">({escalatedPct}%)</span>
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-600 truncate">Resolved:</span>
                <span className="font-bold text-slate-900 ml-auto">{stats.resolved}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                <span className="text-slate-600 truncate">Closed:</span>
                <span className="font-bold text-slate-900 ml-auto">{stats.closed}</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Card (1 col) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Complaints by Category</h2>
                <p className="text-xs text-slate-500 mt-0.5">Distribution across service lines</p>
              </div>
              <Layers className="w-5 h-5 text-slate-400" />
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {stats.byCategory && stats.byCategory.length > 0 ? (
                <div className="space-y-3">
                  {stats.byCategory.map((cat, idx) => {
                    const catPct = Math.round((cat.count / total) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{cat.name}</span>
                          <span className="font-semibold text-slate-900">
                            {cat.count}{' '}
                            <span className="text-slate-600 font-normal">({catPct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            style={{ width: `${Math.max(catPct, 5)}%` }}
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  No categorical activity recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent System Complaints Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent System Complaints</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live incoming stream across all users</p>
            </div>
            <Link
              to="/admin/complaints"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
            >
              <span>View all complaints</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={6} />
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Ticket}
                title="No complaints in system"
                description="When customers file support tickets, they will be registered and displayed here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Complaint ID</th>
                    <th className="py-3.5 px-6">Title</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Assigned Agent</th>
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Status</th>
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
                        {c.customerId?.name || c.customerId?.username || '—'}
                      </td>
                      <td className="py-4 px-6">
                        {c.assignedAgentId ? (
                          <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                            {c.assignedAgentId.name}
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium border border-amber-200/60">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={c.priority} size="sm" />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
