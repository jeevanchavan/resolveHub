// App-level store and configuration constants

export const APP_CONFIG = {
  name: 'ResolveHub',
  version: '1.0.0',
  apiBaseUrl: '/api',
  roles: {
    ADMIN: 'ADMIN',
    AGENT: 'AGENT',
    CUSTOMER: 'CUSTOMER',
  },
  statusColors: {
    OPEN: 'bg-sky-50 text-sky-700 border-sky-200',
    ASSIGNED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    ESCALATED: 'bg-rose-50 text-rose-700 border-rose-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REOPENED: 'bg-purple-50 text-purple-700 border-purple-200',
    CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  priorityColors: {
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export default APP_CONFIG;
