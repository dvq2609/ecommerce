import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  // 1. Chưa đăng nhập -> Chuyển hướng đến /login
  if (!currentUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 2. Chuẩn hóa vai trò người dùng (lowercase)
  const userRole = (currentUser.role || 'buyer').toLowerCase();

  // 3. Kiểm tra quyền truy cập nếu có yêu cầu danh sách vai trò
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
    const hasPermission = normalizedAllowed.includes(userRole);

    if (!hasPermission) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '24px',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '36px 28px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                gpp_bad
              </span>
            </div>

            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '8px',
              }}
            >
              403 - Giới hạn quyền truy cập
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: '#64748b',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              Tài khoản của bạn ({currentUser.email} - Vai trò: <strong>{userRole.toUpperCase()}</strong>) không có quyền truy cập vào khu vực này.
              Vui lòng đăng nhập với tài khoản có quyền <strong>{allowedRoles.map((r) => r.toUpperCase()).join(' hoặc ')}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  storefront
                </span>
                Về trang chủ
              </Link>

              <button
                type="button"
                onClick={() => {
                  authService.logout();
                  window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`;
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#8d1b3d',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  switch_account
                </span>
                Đổi tài khoản
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
