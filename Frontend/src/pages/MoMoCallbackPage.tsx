import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { HomeHeader } from '../components/home/HomeHeader';
import { authService } from '../services/authService';

export const MoMoCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentUser] = useState(() => authService.getCurrentUser());

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Đang kiểm tra kết quả thanh toán từ MoMo...');
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const resultCodeStr = searchParams.get('resultCode');
    const resultCode = resultCodeStr !== null ? parseInt(resultCodeStr, 10) : undefined;

    if (!orderId) {
      setLoading(false);
      setStatusMessage('Không tìm thấy thông tin đơn hàng thanh toán.');
      return;
    }

    setOrderCode(orderId);

    (async () => {
      try {
        const res = await paymentService.queryMoMoCallback(orderId, resultCode);
        if (res.success) {
          if (res.data?.isPaid || resultCode === 0) {
            setIsSuccess(true);
            setStatusMessage('Thanh toán đơn hàng qua Ví MoMo thành công!');
            // Sau 2.5 giây tự động chuyển hướng đến trang OrderSuccess
            setTimeout(() => {
              navigate(`/order-success/${orderId}`, { replace: true });
            }, 2500);
          } else {
            setIsSuccess(false);
            setStatusMessage('Giao dịch MoMo bị hủy hoặc chưa hoàn tất thanh toán.');
          }
        } else {
          setIsSuccess(false);
          setStatusMessage(res.message || 'Không thể xác nhận giao dịch.');
        }
      } catch (err: unknown) {
        setIsSuccess(false);
        setStatusMessage(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, navigate]);

  return (
    <div style={styles.page}>
      <HomeHeader currentUser={currentUser} onLogout={() => authService.logout()} />

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.logoWrap}>
            <span style={{ fontSize: 42 }}>👛</span>
          </div>

          <h1 style={styles.title}>Cổng thanh toán Ví MoMo</h1>

          {loading ? (
            <div style={styles.centerBox}>
              <div style={styles.spinner} />
              <p style={{ marginTop: 16, color: '#6a6a6a', fontSize: 15 }}>{statusMessage}</p>
            </div>
          ) : (
            <div style={styles.centerBox}>
              <div
                style={{
                  ...styles.statusIcon,
                  backgroundColor: isSuccess ? '#dcfce7' : '#fee2e2',
                  color: isSuccess ? '#15803d' : '#991b1b',
                }}
              >
                {isSuccess ? '✓' : '⚠️'}
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '12px 0 8px', color: '#222' }}>
                {isSuccess ? 'Giao dịch thành công' : 'Thanh toán không hoàn tất'}
              </h2>

              <p style={{ fontSize: 14, color: '#6a6a6a', maxWidth: 440, lineHeight: 1.6, margin: '0 auto 24px' }}>
                {statusMessage}
              </p>

              {orderCode && (
                <div style={styles.metaBox}>
                  <span>Mã đơn hàng:</span>
                  <strong style={{ color: '#ff385c' }}>#{orderCode}</strong>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
                {orderCode && (
                  <Link to={`/order-success/${orderCode}`} style={styles.btnPrimary}>
                    Xem chi tiết đơn hàng
                  </Link>
                )}
                <Link to="/" style={styles.btnSecondary}>
                  Về trang chủ
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#f7f7f7', fontFamily: "'Inter', sans-serif", color: '#222' },
  main: { maxWidth: 640, margin: '60px auto 80px', padding: '0 20px' },
  card: { background: '#fff', border: '1px solid #ebebeb', borderRadius: 16, padding: '36px 28px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  logoWrap: { width: 72, height: 72, borderRadius: 20, background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid #fbcfe8' },
  title: { fontSize: 22, fontWeight: 700, margin: '0 0 20px', color: '#a21caf' },
  centerBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' },
  statusIcon: { width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700 },
  metaBox: { background: '#f8fafc', padding: '10px 18px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, display: 'inline-flex', gap: 8 },
  spinner: { width: 36, height: 36, border: '3px solid #ebebeb', borderTopColor: '#a21caf', borderRadius: '50%', animation: 'spin 600ms linear infinite' },
  btnPrimary: { padding: '12px 22px', background: '#ff385c', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' },
  btnSecondary: { padding: '12px 22px', background: '#fff', color: '#222', borderRadius: 8, fontWeight: 500, fontSize: 14, textDecoration: 'none', border: '1px solid #dddddd' },
};
