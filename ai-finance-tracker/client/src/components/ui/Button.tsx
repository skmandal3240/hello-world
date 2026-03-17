import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-brand-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
};
const sizes: Record<Size, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; loading?: boolean;
}

export default function Button({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...props }: ButtonProps) {
  return (
    <button disabled={disabled || loading} className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
      {children}
    </button>
  );
}
