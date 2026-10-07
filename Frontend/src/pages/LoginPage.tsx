import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { TextInput } from '../components/auth/TextInput';
import { PasswordInput } from '../components/auth/PasswordInput';
import { GoogleOAuthButton } from '../components/auth/GoogleOAuthButton';
import { OrDivider } from '../components/auth/OrDivider';
import { useLogin } from '../hooks/useLogin';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, errors, loading, handleChange, handleSubmit } = useLogin('/');

  const [googleError] = useState<string | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const err = searchParams.get('error');
    return err ? decodeURIComponent(err) : null;
  });

  useEffect(() => {
    // Kiểm tra hash khi Google OAuth redirect về
    if (window.location.hash.includes('google_success=true')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('accessToken');
      const refreshToken = hashParams.get('refreshToken');
      const userId = hashParams.get('userId');
      const fullName = hashParams.get('fullName');
      const email = hashParams.get('email');
      const role = hashParams.get('role');
      const imageUrl = hashParams.get('imageUrl');

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (userId && fullName && email) {
          localStorage.setItem('user', JSON.stringify({
            userId: Number(userId),
            fullName,
            email,
            role: role || 'buyer',
            imageUrl: imageUrl || '',
          }));
        }
        window.history.replaceState(null, '', '/');
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5216/api/auth/oauth/google';
  };

  const displayError = googleError || errors.general;

  return (
    <AuthLayout
      activeTab="login"
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để khám phá các bộ sưu tập thời trang & phụ kiện độc quyền tại ShopVibe."
      footerPrompt="Chưa có tài khoản ShopVibe?"
      footerLinkText="Đăng ký ngay"
      footerLinkTo="/register"
    >
      {displayError && (
        <div className="auth-alert auth-alert-error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>{displayError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextInput
          id="login-email"
          label="Email hoặc số điện thoại"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
        />

        <PasswordInput
          id="login-password"
          label="Mật khẩu"
          autoComplete="current-password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          required
        />

        <div className="auth-forgot-link-row">
          <Link to="/forgot-password" className="auth-forgot-link">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          className="btn-primary-auth"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <div className="auth-spinner" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <span>Tiếp tục</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      <OrDivider label="hoặc" />

      <div className="auth-social-stack">
        <GoogleOAuthButton onClick={handleGoogleLogin} label="Tiếp tục với Google" />
      </div>
    </AuthLayout>
  );
};
