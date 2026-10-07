import React from 'react';

export interface OrDividerProps {
  label?: string;
}

export const OrDivider: React.FC<OrDividerProps> = ({ label = 'hoặc' }) => {
  return (
    <div className="auth-or-divider">
      <span className="auth-or-divider-text">{label}</span>
    </div>
  );
};
