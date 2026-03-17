import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string;
}

export default function Select({ label, error, className = '', id, children, ...props }: SelectProps) {
  const selId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={selId} className="text-sm font-medium text-gray-700">{label}</label>}
      <select id={selId} className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${className}`} {...props}>{children}</select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
