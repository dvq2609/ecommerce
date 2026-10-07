import React from 'react';
import { Link } from 'react-router-dom';
import { TextInput } from '../components/auth/TextInput';
import { useForgotPassword } from '../hooks/useForgotPassword';

export const ForgotPasswordPage: React.FC = () => {
  const { email, setEmail, error, successMessage, loading, handleSubmit } = useForgotPassword();

  return (
    <div className="auth-center-layout">
      <div className="auth-center-card">
        {/* Brand header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div className="auth-brand-logo" style={{ width: '44px', height: '44px', borderRadius: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <h1 className="auth-heading" style={{ fontSize: '24px', marginBottom: '8px' }}>
          Quên mật khẩu?
        </h1>
        <p className="auth-subtext" style={{ marginBottom: '28px' }}>
          Đừng lo lắng, hãy nhập email liên kết với tài khoản ShopVibe của bạn. Chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu.
        </p>

        {error && (
          <div className="auth-alert auth-alert-error" role="alert" style={{ textAlign: 'left' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>{error}</div>
          </div>
        )}

        {successMessage ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div className="auth-alert auth-alert-success" role="status" style={{ textAlign: 'left', marginBottom: '24px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>{successMessage}</div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '24px' }}>
              Chưa nhận được email? Kiểm tra thư mục Spam hoặc thử gửi lại sau vài phút.
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '0 32px' }}>
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <TextInput
              id="forgot-email"
              label="Địa chỉ email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              aria-busy={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Đang gửi yêu cầu...</span>
                </>
              ) : (
                'Gửi liên kết đặt lại mật khẩu'
              )}
            </button>

            <div style={{ marginTop: '24px' }}>
              <Link to="/login" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)' }}>
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
