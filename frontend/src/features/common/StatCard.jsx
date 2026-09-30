import React from 'react';
import { ArrowRight } from './Icons.jsx';

/**
 * Modern SaaS KPI Card with subtle border, icon badge, and hover transition
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  onClick,
  active = false,
}) => {
  const colorStyles = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600',
      badge: 'text-indigo-600',
      borderHover: 'hover:border-indigo-300',
      ring: 'ring-indigo-500/20',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      badge: 'text-blue-600',
      borderHover: 'hover:border-blue-300',
      ring: 'ring-blue-500/20',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'text-amber-600',
      borderHover: 'hover:border-amber-300',
      ring: 'ring-amber-500/20',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: 'text-emerald-600',
      borderHover: 'hover:border-emerald-300',
      ring: 'ring-emerald-500/20',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
      badge: 'text-rose-600',
      borderHover: 'hover:border-rose-300',
      ring: 'ring-rose-500/20',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-600',
      badge: 'text-slate-600',
      borderHover: 'hover:border-slate-300',
      ring: 'ring-slate-500/20',
    },
  };

  const scheme = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border border-slate-200/90 rounded-xl p-5 transition-all duration-200 shadow-xs hover:shadow-sm ${
        onClick ? 'cursor-pointer ' + scheme.borderHover : ''
      } ${active ? 'ring-2 ' + scheme.ring : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value ?? 0}
          </p>
        </div>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${scheme.iconBg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className={`font-medium flex items-center gap-1 ${scheme.badge}`}>
            {subtitle}
          </span>
          {onClick && (
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 transition-all" />
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
