import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { TextInput } from '../components/auth/TextInput';
import { PasswordInput } from '../components/auth/PasswordInput';
import { PasswordStrength } from '../components/auth/PasswordStrength';
import { GoogleOAuthButton } from '../components/auth/GoogleOAuthButton';
import { OrDivider } from '../components/auth/OrDivider';
import { useRegister } from '../hooks/useRegister';

export const RegisterPage: React.FC = () => {
  const { formData, errors, loading, handleChange, handleSubmit } = useRegister();

  const handleGoogleRegister = () => {
    window.location.href = 'http://localhost:5216/api/auth/oauth/google';
  };

  return (
    <AuthLayout
      activeTab="register"
      title="Tạo tài khoản mới"
      subtitle="Nhận ngay voucher chào mừng 15% và trải nghiệm các bộ sưu tập giới hạn."
      footerPrompt="Đã có tài khoản ShopVibe?"
      footerLinkText="Đăng nhập ngay"
      footerLinkTo="/login"
    >
      {errors.general && (
        <div className="auth-alert auth-alert-error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>{errors.general}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Họ và tên (match RegisterDto.FullName) */}
        <TextInput
          id="reg-fullname"
          label="Họ và tên"
          autoComplete="name"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          error={errors.fullName}
          required
        />

        {/* Email (match RegisterDto.Email) */}
        <TextInput
          id="reg-email"
          label="Địa chỉ email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
        />

        {/* Số điện thoại (match RegisterDto.PhoneNumber - tùy chọn) */}
        <TextInput
          id="reg-phone"
          label="Số điện thoại (tùy chọn)"
          type="tel"
          autoComplete="tel"
          value={formData.phoneNumber || ''}
          onChange={(e) => handleChange('phoneNumber', e.target.value)}
          error={errors.phoneNumber}
        />

        {/* Mật khẩu (match RegisterDto.Password) */}
        <div>
          <PasswordInput
            id="reg-password"
            label="Mật khẩu (tối thiểu 6 ký tự)"
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            required
          />
          <PasswordStrength password={formData.password} />
        </div>

        {/* Điều khoản & Chính sách */}
        <div style={{ marginTop: '10px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-on-surface-variant)', lineHeight: 1.45 }}>
            <input
              type="checkbox"
              id="reg-terms"
              checked={formData.agreeTerms}
              onChange={(e) => handleChange('agreeTerms', e.target.checked)}
              style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
            <span>
              Tôi đồng ý với{' '}
              <a href="#terms" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                Điều khoản sử dụng
              </a>{' '}
              &amp;{' '}
              <a href="#privacy" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                Chính sách bảo mật
              </a>
            </span>
          </label>
          {errors.agreeTerms && (
            <div className="auth-inline-error" style={{ marginTop: '4px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errors.agreeTerms}</span>
            </div>
          )}
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          className="btn-primary-auth"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <div className="auth-spinner" />
              <span>Đang tạo tài khoản...</span>
            </>
          ) : (
            <>
              <span>Đăng ký tài khoản</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      <OrDivider label="hoặc" />

      {/* Social login (chỉ có Google, đã bỏ Apple theo yêu cầu) */}
      <div className="auth-social-stack">
        <GoogleOAuthButton onClick={handleGoogleRegister} label="Tiếp tục với Google" />
      </div>
    </AuthLayout>
  );
};
