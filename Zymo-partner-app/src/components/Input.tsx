import React, { useEffect } from "react";

export function Input({ label, error, className = '', ...props }: any) {
  useEffect(() => {
    const preventScroll = (event: WheelEvent) => {
      if (document.activeElement && (document.activeElement as HTMLInputElement).type === "number") {
        event.preventDefault();
      }
    };

    document.addEventListener("wheel", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("wheel", preventScroll);
    };
  }, []);

  return (
    <div className="space-y-2 my-2">
      <label htmlFor={props.id} className="block px-1 text-sm font-medium dark:text-white">
        {label}
      </label>
      <input
        className={`appearance-none block w-full px-3 bg-transparent dark:bg-lightgray py-2 rounded-2xl shadow-sm border border-gray-500 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-lime focus:border-lime sm:text-sm ${
          error ? 'border-red-300' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
