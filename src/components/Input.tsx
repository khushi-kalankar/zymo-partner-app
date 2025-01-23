import React, { ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2 my-2">
      <label htmlFor={props.id} className="block px-1 text-sm font-medium  dark:text-white">
        {label}
      </label>
      <input
        className={`appearance-none block w-full px-3  bg-transparent dark:bg-gray-800 py-2 rounded-2xl shadow-sm border border-gray-500 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-lime focus:border-lime sm:text-sm ${
          error ? 'border-red-300' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}