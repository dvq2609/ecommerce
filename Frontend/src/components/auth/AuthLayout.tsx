import React from 'react';
import { Link } from 'react-router-dom';

export interface AuthLayoutProps {
  children: React.ReactNode;
  activeTab: 'login' | 'register';
  title: string;
  subtitle: string;
  footerPrompt: string;
  footerLinkText: string;
  footerLinkTo: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  activeTab,
  title,
  subtitle,
  footerPrompt,
  footerLinkText,
  footerLinkTo,
}) => {
  return (
    <div className="auth-page-wrapper">
      {/* Top Segmented Mode Switcher (Pill tabs) */}
      <div className="auth-tab-switcher" role="tablist">
        <Link
          to="/login"
          role="tab"
          aria-selected={activeTab === 'login'}
          className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          role="tab"
          aria-selected={activeTab === 'register'}
          className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
        >
          Đăng ký
        </Link>
      </div>

      {/* Main Floating Card */}
      <div className="auth-main-card">
        {/* Brand Header */}
        <div className="auth-card-header">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }} aria-label="ShopVibe Home">
            <img
              src="/shopping-bag.png"
              alt="ShopVibe Logo"
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          <h1 className="auth-card-title">{title}</h1>
          <p className="auth-card-subtitle">{subtitle}</p>
        </div>

        {/* Form Body */}
        {children}

        {/* Card Footer Switch Link */}
        <div className="auth-card-footer" style={{ marginTop: '20px' }}>
          <span>{footerPrompt}</span>
          <Link to={footerLinkTo}>
            <strong>{footerLinkText}</strong>
          </Link>
        </div>
      </div>

      {/* Security & Legal Badge Notice under card */}
      <div className="auth-security-notice">
        <div className="auth-security-badge-row">


        </div>
        <p className="auth-security-desc">
          Bằng cách tiếp tục, bạn đồng ý với{' '}
          <a href="#terms" target="_blank" rel="noreferrer">
            Điều khoản sử dụng
          </a>{' '}
          và{' '}
          <a href="#privacy" target="_blank" rel="noreferrer">
            Chính sách quyền riêng tư
          </a>{' '}
          của ShopVibe.
        </p>
      </div>
    </div>
  );
};
