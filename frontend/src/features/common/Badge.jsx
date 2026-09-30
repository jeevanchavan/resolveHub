import React from 'react';

/**
 * Modern Status Badge with subtle dot indicator and accessible contrast
 */
export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const normStatus = (status || '').toUpperCase().trim();

  const configs = {
    OPEN: {
      label: 'Open',
      bg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      dot: 'bg-sky-500',
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      dot: 'bg-indigo-500',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      dot: 'bg-blue-500 animate-pulse',
    },
    ESCALATED: {
      label: 'Escalated',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    REOPENED: {
      label: 'Reopened',
      bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      dot: 'bg-purple-500',
    },
    CLOSED: {
      label: 'Closed',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const config = configs[normStatus] || {
    label: normStatus.replace(/_/g, ' ') || 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

/**
 * Priority Badge with clean SaaS severity indicators
 */
export const PriorityBadge = ({ priority, size = 'md', className = '' }) => {
  const normPriority = (priority || '').toUpperCase().trim();

  const configs = {
    LOW: {
      label: 'Low',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      indicator: 'bg-emerald-500',
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/70',
      indicator: 'bg-amber-500',
    },
    HIGH: {
      label: 'High',
      bg: 'bg-orange-50 text-orange-700 border-orange-200/70',
      indicator: 'bg-orange-500',
    },
    CRITICAL: {
      label: 'Critical',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80 font-semibold',
      indicator: 'bg-rose-600',
    },
  };

  const config = configs[normPriority] || {
    label: normPriority || 'Normal',
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    indicator: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.indicator}`} />
      <span>{config.label}</span>
    </span>
  );
};

/**
 * Role Badge (Admin, Agent, Customer)
 */
export const RoleBadge = ({ role, size = 'sm', className = '' }) => {
  const normRole = (role || '').toUpperCase().trim();

  const configs = {
    ADMIN: {
      label: 'Administrator',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    AGENT: {
      label: 'Support Agent',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    CUSTOMER: {
      label: 'Customer',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  };

  const config = configs[normRole] || {
    label: normRole || 'User',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 font-semibold tracking-wide uppercase',
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-xs px-3 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {config.label}
    </span>
  );
};

const Badges = { StatusBadge, PriorityBadge, RoleBadge };
export default Badges;
