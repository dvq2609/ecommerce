import React from 'react';

export interface PasswordStrengthProps {
  password?: string;
}

interface StrengthInfo {
  score: number; // 0 to 4
  label: string;
  color: string;
}

const calculateStrength = (pwd: string = ''): StrengthInfo => {
  if (!pwd) return { score: 0, label: 'Chưa nhập', color: 'var(--color-on-surface-variant)' };
  if (pwd.length < 6) return { score: 1, label: 'Yếu', color: 'var(--color-error)' };

  let points = 1;
  if (pwd.length >= 8) points++;
  if (/[0-9]/.test(pwd)) points++;
  if (/[A-Z]/.test(pwd) || /[^a-zA-Z0-9]/.test(pwd)) points++;

  if (points >= 4) {
    return { score: 4, label: 'Rất mạnh', color: 'var(--color-success)' };
  } else if (points >= 2) {
    return { score: 2, label: 'Trung bình', color: 'var(--color-warning)' };
  } else {
    return { score: 1, label: 'Yếu', color: 'var(--color-error)' };
  }
};

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  if (!password) return null;

  const { score, label, color } = calculateStrength(password);

  return (
    <div className="password-strength-box">
      <div className="strength-header">
        <span>Độ mạnh mật khẩu</span>
        <span style={{ fontWeight: 600, color }}>{label}</span>
      </div>
      <div className="strength-segments-row">
        {[1, 2, 3, 4].map((index) => {
          const isFilled = index <= score;
          return (
            <div
              key={index}
              className="strength-segment-item"
              style={{
                backgroundColor: isFilled ? color : 'var(--color-surface-container)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
