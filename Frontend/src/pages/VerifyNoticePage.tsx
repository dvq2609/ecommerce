import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService, ApiError } from '../services/authService';

export const VerifyNoticePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'email của bạn';

  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || resending || !email.includes('@')) return;

    setResending(true);
    setFeedback(null);

    try {
      const res = await authService.resendVerification({ email });
      setFeedback({ text: res.message || 'Đã gửi lại email xác thực thành công!', isError: false });
      setCountdown(60); // 60s cooldown
    } catch (err) {
      if (err instanceof ApiError) {
        setFeedback({ text: err.message, isError: true });
      } else {
        setFeedback({ text: 'Không thể gửi lại email vào lúc này. Vui lòng thử lại sau.', isError: true });
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-center-layout">
      <div className="auth-center-card">
        {/* Envelope Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fff0f3',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
        </div>

        <h1 className="auth-heading" style={{ fontSize: '24px', marginBottom: '10px' }}>
          Kiểm tra hòm thư của bạn
        </h1>

        <p className="auth-subtext" style={{ marginBottom: '16px' }}>
          Chúng tôi đã gửi đường dẫn kích hoạt tài khoản tới:
        </p>

        <div
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: 'var(--color-surface-soft)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            color: 'var(--color-ink)',
            marginBottom: '24px',
            wordBreak: 'break-all',
          }}
        >
          {email}
        </div>

        <p style={{ fontSize: '14px', color: 'var(--color-body)', lineHeight: 1.6, marginBottom: '28px' }}>
          Vui lòng bấm vào nút <strong>Xác thực tài khoản</strong> trong email để hoàn tất đăng ký và bắt đầu trải nghiệm mua sắm cùng ShopVibe.
        </p>

        {feedback && (
          <div
            className={`auth-alert ${feedback.isError ? 'auth-alert-error' : 'auth-alert-success'}`}
            role="status"
            style={{ textAlign: 'left', marginBottom: '20px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>{feedback.text}</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/login" className="btn-primary">
            Đến trang Đăng nhập
          </Link>

          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            style={{
              padding: '12px',
              fontSize: '14px',
              color: countdown > 0 ? 'var(--color-muted)' : 'var(--color-ink)',
              fontWeight: 500,
              textDecoration: countdown > 0 ? 'none' : 'underline',
              cursor: countdown > 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {resending
              ? 'Đang gửi lại...'
              : countdown > 0
              ? `Gửi lại email sau (${countdown}s)`
              : 'Chưa nhận được? Gửi lại email xác thực'}
          </button>
        </div>
      </div>
    </div>
  );
};
