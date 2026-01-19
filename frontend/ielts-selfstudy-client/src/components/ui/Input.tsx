import React, { forwardRef } from 'react';

export interface InputProps {
  label?: string;
  error?: boolean;
  helperText?: string;
  as?: 'input' | 'textarea';
  // Allow all HTML input and textarea attributes
  [key: string]: any;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, label, error, helperText, as = 'input', ...props }, ref) => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors sm:text-sm';

    const stateClasses = error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500';

    const finalClassName = [baseClasses, stateClasses, className].filter(Boolean).join(' ');

    const style: React.CSSProperties = {
      borderColor: error ? 'var(--color-primary-300)' : undefined,
    };

    return (
    <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        {as === 'textarea' ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
          className={finalClassName}
          style={style}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
          className={finalClassName}
          style={style}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {helperText && (
          <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;