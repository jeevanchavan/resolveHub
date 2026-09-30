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
  CheckCircle2,
  ShieldCheck,
  Plus,
  ArrowRight,
} from '../../common/Icons.jsx';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
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
        console.error('Failed to load customer dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name || user?.username || 'Customer';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header / Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              <span>Overview</span>
              <span>&bull;</span>
              <span>Customer Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {getGreeting()}, {userName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your submitted complaints and view their live resolution progress.
            </p>
          </div>

          <Link
            to="/customer/complaints/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>File New Complaint</span>
          </Link>
        </div>

        {/* KPI Stats Grid */}
        {loading ? (
          <CardSkeleton count={5} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Complaints"
              value={stats.total}
              subtitle="View all tickets"
              icon={Ticket}
              color="indigo"
              onClick={() => navigate('/customer/complaints')}
            />
            <StatCard
              title="Open"
              value={stats.open}
              subtitle="Submitted"
              icon={Clock}
              color="blue"
              onClick={() => navigate('/customer/complaints?status=OPEN')}
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              subtitle="Under review"
              icon={RefreshCw}
              color="amber"
              onClick={() => navigate('/customer/complaints?status=IN_PROGRESS')}
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              subtitle="Ready for review"
              icon={CheckCircle2}
              color="emerald"
              onClick={() => navigate('/customer/complaints?status=RESOLVED')}
            />
            <StatCard
              title="Closed"
              value={stats.closed}
              subtitle="Completed"
              icon={ShieldCheck}
              color="slate"
              onClick={() => navigate('/customer/complaints?status=CLOSED')}
            />
          </div>
        )}

        {/* Recent Complaints Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Complaints</h2>
              <p className="text-xs text-slate-500 mt-0.5">Most recent issues submitted to support</p>
            </div>
            <Link
              to="/customer/complaints"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
            >
              <span>View all complaints</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={5} />
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Ticket}
                title="No complaints filed yet"
                description="If you have encountered an issue with your service or hardware, file a ticket to receive assistance."
                actionLabel="File a complaint"
                onAction={() => navigate('/customer/complaints/new')}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Complaint ID</th>
                    <th className="py-3.5 px-6">Title</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => navigate(`/customer/complaints/${c._id}`)}
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

export default CustomerDashboard;
