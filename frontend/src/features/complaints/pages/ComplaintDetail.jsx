import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../dashboard/components/DashboardLayout.jsx';
import { useAuth } from '../../auth/hook/useAuth.js';
import {
  getComplaintById,
  getAgents,
  assignAgent,
  updatePriority,
  startComplaint,
  addNote,
  resolveComplaint,
  escalateComplaint,
  closeComplaint,
  reopenComplaint,
} from '../service/api.js';
import { StatusBadge, PriorityBadge, RoleBadge } from '../../common/Badge.jsx';
import { TableSkeleton } from '../../common/LoadingSkeleton.jsx';
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Printer,
  ChevronRight,
  AlertCircle,
  Check,
  Send,
} from '../../common/Icons.jsx';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historySortOrder, setHistorySortOrder] = useState('desc');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Admin Assignment State
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Agent Workflow Form States
  const [newNote, setNewNote] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [escalateNote, setEscalateNote] = useState('');
  const [showEscalateInput, setShowEscalateInput] = useState(false);

  // Customer Reopen State
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);

  const fetchComplaint = async () => {
    try {
      const data = await getComplaintById(id);
      setComplaint(data.complaint);
      setHistory(data.history || []);
      if (data.complaint?.assignedAgentId?._id) {
        setSelectedAgentId(data.complaint.assignedAgentId._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const fetchAgentList = async () => {
        try {
          const data = await getAgents();
          setAgents(data.agents || []);
        } catch (err) {
          console.error('Failed to load agents list', err);
        }
      };
      fetchAgentList();
    }
  }, [user?.role]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setError('');
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const showError = (msg) => {
    setError(msg);
    setSuccessMsg('');
    setTimeout(() => setError(''), 6000);
  };

  // Admin Actions
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) return;
    setActionLoading(true);
    try {
      const res = await assignAgent(id, selectedAgentId);
      showSuccess(res.message || 'Agent assigned successfully!');
      await fetchComplaint();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to assign agent');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (newPriority === complaint.priority) return;
    setActionLoading(true);
    try {
      const res = await updatePriority(id, newPriority);
      showSuccess(res.message || 'Priority updated successfully!');
      await fetchComplaint();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update priority');
    } finally {
      setActionLoading(false);
    }
  };

  // Agent Actions
  const handleStartWorking = async () => {
    setActionLoading(true);
    try {
      const res = await startComplaint(id);
      showSuccess(res.message || 'Investigation started!');
      await fetchComplaint();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to start investigation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setActionLoading(true);
    try {
      const res = await addNote(id, newNote);
      showSuccess(res.message || 'Note added successfully!');
      setNewNote('');
      await fetchComplaint();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolutionText.trim()) {
      showError('Please provide resolution details');
      return;
    }
    setActionLoading(true);
    try {
      const res = await resolveComplaint(id, resolutionText);
      showSuccess(res.message || 'Complaint resolved successfully!');
      setResolutionText('');
      await fetchComplaint();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to resolve complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    setActionLoading(true);
    try {
      const res = await escalateComplaint(id, escalateNote);
      showSuccess(res.message || 'Complaint escalated to senior review!');
      setEscalateNote('');
      setShowEscalateInput(false);
      await fetchComplaint();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to escalate complaint');
    } finally {
      setActionLoading(false);
    }
  };

  // Customer Actions
  const handleClose = async () => {
    if (!window.confirm('Are you satisfied with the resolution and wish to close this complaint?')) return;
    setActionLoading(true);
    try {
      const res = await closeComplaint(id);
      showSuccess(res.message || 'Complaint closed successfully! Thank you.');
      await fetchComplaint();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to close complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      showError('Please provide a reason for reopening');
      return;
    }
    setActionLoading(true);
    try {
      const res = await reopenComplaint(id, reopenReason);
      showSuccess(res.message || 'Complaint reopened for further review.');
      setReopenReason('');
      setShowReopenInput(false);
      await fetchComplaint();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reopen complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const backPath =
    user?.role === 'CUSTOMER'
      ? '/customer/complaints'
      : user?.role === 'AGENT'
      ? '/agent/complaints'
      : '/admin/complaints';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12">
          <TableSkeleton rows={4} cols={4} />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !complaint) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">{error || 'Complaint not found'}</h2>
          <p className="text-sm text-slate-500 mt-1">The ticket you requested could not be retrieved.</p>
          <Link
            to={backPath}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Complaints</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isAssignedAgent =
    user?.role === 'AGENT' &&
    (complaint?.assignedAgentId?._id === user?.id ||
      complaint?.assignedAgentId?._id === user?._id ||
      complaint?.assignedAgentId === user?.id);
  const isOwnerCustomer = user?.role === 'CUSTOMER';

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to={backPath}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Complaints list</span>
          </Link>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. ADMIN ACTIONS PANEL */}
        {/* ========================================================================= */}
        {user?.role === 'ADMIN' && (
          <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Administrator Assignment & Priority Controls
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agent Assignment Form */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Assign Support Agent
                </label>
                <form onSubmit={handleAssign} className="flex gap-2">
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  >
                    <option value="">Select an agent</option>
                    {agents.map((ag) => (
                      <option key={ag._id} value={ag._id}>
                        {ag.name} ({ag.email})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={actionLoading || !selectedAgentId}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-60 cursor-pointer shrink-0"
                  >
                    {complaint.assignedAgentId ? 'Reassign' : 'Assign'}
                  </button>
                </form>
              </div>

              {/* Priority Adjustment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Adjust Priority Level
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => {
                    const isCurrent = complaint.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handlePriorityChange(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Admin Escalation */}
            {['IN_PROGRESS', 'ASSIGNED'].includes(complaint.status) && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ticket requires higher managerial oversight?
                </span>
                <button
                  type="button"
                  onClick={handleEscalate}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Escalate to High Severity</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SUPPORT AGENT WORKFLOW PANEL */}
        {/* ========================================================================= */}
        {isAssignedAgent && complaint.status !== 'CLOSED' && (
          <div className="bg-white border border-emerald-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Support Agent Workflow & Investigation
              </h2>
            </div>

            {/* Step A: Start Investigation */}
            {['ASSIGNED', 'REOPENED', 'ESCALATED'].includes(complaint.status) && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {complaint.status === 'ASSIGNED' && 'This ticket is assigned to you and awaiting kickoff.'}
                    {complaint.status === 'REOPENED' && 'Customer has reopened this ticket for further review.'}
                    {complaint.status === 'ESCALATED' && 'This ticket was escalated and requires immediate action.'}
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Click to transition ticket status to IN_PROGRESS and notify customer.
                  </p>
                </div>
                <button
                  onClick={handleStartWorking}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all shrink-0 cursor-pointer"
                >
                  {actionLoading ? 'Updating...' : 'Start Investigation'}
                </button>
              </div>
            )}

            {/* Step B: In Progress Controls (Notes, Resolve, Escalate) */}
            {complaint.status === 'IN_PROGRESS' && (
              <div className="space-y-4">
                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Add Investigation Finding / Diagnostic Note
                  </label>
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter diagnostic finding, customer contact note, or test result..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={actionLoading || !newNote.trim()}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post Note</span>
                    </button>
                  </div>
                </form>

                {/* Final Resolution Form */}
                <form
                  onSubmit={handleResolve}
                  className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3"
                >
                  <div>
                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Provide Final Resolution (Required to Resolve) *
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Detail the solution, dispatch ID, replacement tracking, or fix delivered to customer.
                    </p>
                  </div>
                  <textarea
                    rows={3}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    required
                    placeholder="e.g. Verified issue with power surge. Processed replacement unit under warranty dispatch #REP-8821."
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEscalateInput(!showEscalateInput)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{showEscalateInput ? 'Hide Escalation Input' : 'Need to Escalate?'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={actionLoading || !resolutionText.trim()}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {actionLoading ? 'Saving...' : '✓ Mark as RESOLVED'}
                    </button>
                  </div>

                  {showEscalateInput && (
                    <div className="pt-3 border-t border-emerald-200/80 space-y-2">
                      <input
                        type="text"
                        value={escalateNote}
                        onChange={(e) => setEscalateNote(e.target.value)}
                        placeholder="Reason for escalation to admin/senior support..."
                        className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                      <button
                        type="button"
                        onClick={handleEscalate}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        Confirm Escalation
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {complaint.status === 'RESOLVED' && (
              <p className="text-xs font-medium text-emerald-700">
                Resolution provided. Awaiting customer confirmation and closure.
              </p>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CUSTOMER RESOLUTION REVIEW PANEL */}
        {/* ========================================================================= */}
        {isOwnerCustomer && complaint.status === 'RESOLVED' && (
          <div className="bg-white border-2 border-emerald-400 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Support Has Provided a Resolution</h2>
                <p className="text-xs text-slate-500">
                  Please review the solution below and indicate whether your issue is resolved.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Resolution Details
              </span>
              <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
                {complaint.resolution}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleClose}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Accept & Close Complaint</span>
              </button>

              <button
                onClick={() => setShowReopenInput(!showReopenInput)}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Issue Not Solved — Reopen</span>
              </button>
            </div>

            {showReopenInput && (
              <form onSubmit={handleReopen} className="pt-3 border-t border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-rose-700">
                  Why is the issue not solved? (Required)
                </label>
                <textarea
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  required
                  placeholder="Explain why the resolution did not fix your issue..."
                  className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                <button
                  type="submit"
                  disabled={actionLoading || !reopenReason.trim()}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Submit & Reopen Complaint
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. MAIN COMPLAINT CARD */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80">
                  {complaint.complaintId}
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs font-medium text-slate-500">
                  {complaint.categoryId?.name || 'General Category'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {complaint.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <PriorityBadge priority={complaint.priority} size="md" />
              <StatusBadge status={complaint.status} size="md" />
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                Submitted By
              </span>
              <span className="text-slate-900 font-medium mt-1 block">
                {complaint.customerId?.name || complaint.customerId?.username || '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                Assigned Agent
              </span>
              <span className="text-slate-900 font-medium mt-1 block">
                {complaint.assignedAgentId?.name || (
                  <span className="text-amber-600 font-semibold">Unassigned</span>
                )}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                Created On
              </span>
              <span className="text-slate-900 font-medium mt-1 block">
                {formatDate(complaint.createdAt)}
              </span>
            </div>

            {complaint.resolvedAt && (
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                  Resolved On
                </span>
                <span className="text-emerald-700 font-medium mt-1 block">
                  {formatDate(complaint.resolvedAt)}
                </span>
              </div>
            )}

            {complaint.closedAt && (
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                  Closed On
                </span>
                <span className="text-slate-700 font-medium mt-1 block">
                  {formatDate(complaint.closedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Issue Description
            </h2>
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </div>
          </div>

          {/* Resolution Display if available */}
          {complaint.resolution && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Delivered Resolution
              </h2>
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {complaint.resolution}
              </div>
            </div>
          )}

          {/* Investigation Notes list */}
          {complaint.investigationNotes?.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Internal Investigation Notes ({complaint.investigationNotes.length})
                </h2>
              </div>
              <div className="space-y-2.5">
                {complaint.investigationNotes.map((n, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
                  >
                    <p className="text-slate-800 text-sm">{n.note}</p>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span className="font-semibold text-slate-700">
                        {n.addedBy?.name || 'Staff Member'}
                      </span>
                      <span>&bull;</span>
                      <span>{formatDate(n.addedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. AUDIT TRAIL & LIFECYCLE TIMELINE (PHASE 6) */}
        {/* ========================================================================= */}
        {history.length > 0 && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-indigo-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Complaint Audit Trail & Lifecycle
                  </h2>
                  <p className="text-xs text-slate-500">
                    Timestamped audit log of all system transitions and actions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHistorySortOrder(historySortOrder === 'desc' ? 'asc' : 'desc')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  ↕ {historySortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Log</span>
                </button>
              </div>
            </div>

            {/* Timeline Events */}
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 before:content-['']">
              {(historySortOrder === 'desc' ? [...history] : [...history].reverse()).map((h, i) => {
                const userRole = h.performedBy?.role || 'SYSTEM';

                return (
                  <div key={h._id || i} className="relative flex items-start gap-4 pl-1">
                    {/* Timeline Node Dot */}
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shrink-0 z-10 shadow-2xs mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    </div>

                    {/* Event Content Card */}
                    <div className="flex-1 bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {h.action?.replace(/_/g, ' ')}
                          </span>
                          {h.previousStatus && h.newStatus && h.previousStatus !== h.newStatus && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] text-slate-600">
                              <span>{h.previousStatus}</span>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                              <span className="font-bold text-indigo-600">{h.newStatus}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatDate(h.createdAt)}
                        </span>
                      </div>

                      {h.comment && (
                        <p className="p-2.5 rounded-lg bg-white border border-slate-200/60 text-slate-700 leading-relaxed text-xs">
                          {h.comment}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <span>Performed by:</span>
                        <span className="font-semibold text-slate-800">
                          {h.performedBy?.name || h.performedBy?.username || 'System Automation'}
                        </span>
                        <RoleBadge role={userRole} size="xs" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ComplaintDetail;
