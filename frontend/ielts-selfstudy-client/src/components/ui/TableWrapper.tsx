import React from 'react';

export interface TableWrapperProps {
  children?: React.ReactNode;
  className?: string;
}

export const TableWrapper: React.FC<TableWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`table-responsive ${className}`} style={{ width: '100%', overflowX: 'auto' }}>
      <div className="min-w-full">
        {children}
      </div>
    </div>
  );
};

export default TableWrapper;


