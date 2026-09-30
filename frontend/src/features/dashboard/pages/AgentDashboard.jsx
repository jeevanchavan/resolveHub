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
  ArrowRight,
} from '../../common/Icons.jsx';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, assigned: 0, inProgress: 0, escalated: 0, resolved: 0, pending: 0 });
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
        console.error('Failed to load agent dashboard', err);
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

  const userName = user?.name || user?.username || 'Agent';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header / Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              <span>Agent Workspace</span>
              <span>&bull;</span>
              <span>Resolution Queue</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {getGreeting()}, {userName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here are the customer complaints currently assigned to you for investigation and resolution.
            </p>
          </div>

          <Link
            to="/agent/complaints"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
          >
            <span>View All Assignments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Metric Cards Grid */}
        {loading ? (
          <CardSkeleton count={5} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Assigned Queue"
              value={stats.total}
              subtitle="All assignments"
              icon={Ticket}
              color="indigo"
              onClick={() => navigate('/agent/complaints')}
            />
            <StatCard
              title="Pending (New)"
              value={stats.assigned}
              subtitle="To be started"
              icon={Clock}
              color="blue"
              onClick={() => navigate('/agent/complaints?status=ASSIGNED')}
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              subtitle="Investigating"
              icon={RefreshCw}
              color="amber"
              onClick={() => navigate('/agent/complaints?status=IN_PROGRESS')}
            />
            <StatCard
              title="Escalated"
              value={stats.escalated}
              subtitle="Urgent attention"
              icon={AlertTriangle}
              color="rose"
              onClick={() => navigate('/agent/complaints?status=ESCALATED')}
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              subtitle="Completed"
              icon={CheckCircle2}
              color="emerald"
              onClick={() => navigate('/agent/complaints?status=RESOLVED')}
            />
          </div>
        )}

        {/* Recent Assignments Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Assignments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Complaints in your active queue</p>
            </div>
            <Link
              to="/agent/complaints"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
            >
              <span>View all assignments</span>
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
                title="No active assignments"
                description="Your queue is clear! When new complaints are assigned to you by administrators, they will appear here."
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
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => navigate(`/agent/complaints/${c._id}`)}
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

export default AgentDashboard;
