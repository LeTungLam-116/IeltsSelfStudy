import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({ label, size = 'md', className = '', children, ...props }, ref) => {
  const sizeClasses = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2';
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={`${sizeClasses} inline-flex items-center justify-center rounded-md hover:bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;


