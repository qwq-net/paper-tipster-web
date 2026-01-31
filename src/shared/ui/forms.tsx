import React from 'react';

// Label
export const Label = ({
  children,
  htmlFor,
  className = '',
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label htmlFor={htmlFor} className={`mb-1.5 block text-sm font-semibold text-gray-700 ${className}`}>
    {children}
  </label>
);

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`focus:ring-primary/20 focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// Select
export const Select = ({
  children,
  value,
  onValueChange,
  className = '',
}: {
  children: React.ReactNode;
  value: string;
  onValueChange: (v: string) => void;
  className?: string;
}) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="focus:ring-primary/20 focus:border-primary w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};

export const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <option value="" disabled>
    {placeholder}
  </option>
);
export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);
