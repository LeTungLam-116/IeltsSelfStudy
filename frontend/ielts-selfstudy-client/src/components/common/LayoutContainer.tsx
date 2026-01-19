import React from 'react';

export default function LayoutContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}


