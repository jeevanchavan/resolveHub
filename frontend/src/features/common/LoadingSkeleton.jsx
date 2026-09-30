import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
  };
  return (
    <div
      className={`inline-block rounded-full border-solid border-current border-r-transparent animate-spin ${
        sizeMap[size] || sizeMap.md
      } ${className}`}
      role="status"
      aria-label="loading"
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-xl overflow-hidden animate-pulse">
      <div className="h-11 bg-slate-100/70 border-b border-slate-200" />
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="h-4 bg-slate-200 rounded w-16" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-20" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
            <div className="h-6 bg-slate-200 rounded-full w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200/90 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-slate-200 rounded w-24" />
            <div className="w-9 h-9 bg-slate-200 rounded-lg" />
          </div>
          <div className="mt-3 h-8 bg-slate-200 rounded w-16" />
          <div className="mt-4 pt-3 border-t border-slate-100 h-3 bg-slate-100 rounded w-28" />
        </div>
      ))}
    </div>
  );
};

export default { Spinner, TableSkeleton, CardSkeleton };
