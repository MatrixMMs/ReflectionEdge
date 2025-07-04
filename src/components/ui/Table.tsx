import React from 'react';

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <table className={`w-full text-sm text-left text-gray-400 ${className}`}>
    {children}
  </table>
);

export const Thead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <thead className={`text-xs text-gray-300 uppercase bg-gray-700 ${className}`} style={{ backgroundColor: 'var(--background-tertiary)', color: 'var(--text-secondary)' }}>
    {children}
  </thead>
);

export const Tbody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tbody className={className}>
    {children}
  </tbody>
);

export const Tr: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tr className={`border-b border-gray-700 hover:bg-gray-700/50 ${className}`} style={{ borderBottomColor: 'var(--border-main)' }}>
    {children}
  </tr>
);

export const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th scope="col" className={`px-4 py-3 ${className}`}>
    {children}
  </th>
);

export const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td className={`px-4 py-3 ${className}`}>
    {children}
  </td>
); 