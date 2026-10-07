import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fcfcfc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          height: '80px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--color-hairline-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img
            src="/shopping-bag.png"
            alt="ShopVibe Logo"
            style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>
            ShopVibe
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  {currentUser.fullName}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                  {currentUser.email}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background var(--anim-fast)',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to="/login"
                style={{
                  padding: '10px 20px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{
                  width: 'auto',
                  padding: '0 24px',
                  height: '42px',
                  fontSize: '14px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1128px', margin: '0 auto', padding: '64px 24px', width: '100%', flex: 1 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #fff5f6 0%, #ffffff 100%)',
            border: '1px solid #ffe1e6',
            borderRadius: 'var(--radius-lg)',
            padding: '48px',
            marginBottom: '48px',
          }}
        >
          <span style={{ display: 'inline-block', padding: '4px 12px', background: '#ffe6eb', color: 'var(--color-primary)', borderRadius: '20px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            Hệ thống xác thực ShopVibe v1.0
          </span>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.5px', marginBottom: '16px' }}>
            {currentUser ? `Chào mừng trở lại, ${currentUser.fullName}! 🎉` : 'Trải nghiệm mua sắm đẳng cấp cùng ShopVibe'}
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--color-body)', maxWidth: '640px', lineHeight: 1.6, marginBottom: '32px' }}>
            Toàn bộ các trang xác thực đã được xây dựng theo chuẩn Airbnb Design System: tối giản, tinh tế, mượt mà và tối ưu trải nghiệm người dùng trên mọi thiết bị.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <Link to="/login" className="btn-primary" style={{ width: 'auto', padding: '0 28px' }}>
              Màn hình Đăng nhập (Login)
            </Link>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 28px',
                height: '48px',
                border: '1px solid var(--color-ink)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-ink)',
                background: '#ffffff',
              }}
            >
              Màn hình Đăng ký (Register)
            </Link>
            <Link
              to="/forgot-password"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 24px',
                height: '48px',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--color-muted)',
              }}
            >
              Quên mật khẩu
            </Link>
            <Link
              to="/verify-notice?email=demo@shopvibe.vn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 24px',
                height: '48px',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--color-muted)',
              }}
            >
              Thông báo xác thực email
            </Link>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-md)', padding: '28px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🎨</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Airbnb Design System</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Màu chủ đạo Rausch (#ff385c), font chữ Inter rõ ràng, border focus 2px mực tối giản, không viền phát sáng (no glow).
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-md)', padding: '28px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>📱</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Responsive Adaptive</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Desktop màn hình kép 50/50 với ảnh lifestyle sang trọng; tự động co lại thành form card mềm mại ở màn hình mobile & tablet.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-md)', padding: '28px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Bảo mật & Tích hợp</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Đồng bộ chính xác với ASP.NET Core Backend: JWT Token Rotation, xác thực email, kiểm tra độ mạnh mật khẩu và Google OAuth2.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
