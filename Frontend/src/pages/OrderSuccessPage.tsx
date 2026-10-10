import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { orderService, orderStatusMeta, paymentMethodLabel } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { HomeHeader } from '../components/home/HomeHeader';
import { authService } from '../services/authService';
import type { OrderResponse } from '../types/order';

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDate = (s: string) => {
  if (!s) return '';
  const dateStr = s.endsWith('Z') || s.includes('+') ? s : `${s}Z`;
  return new Date(dateStr).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const OrderSuccessPage: React.FC = () => {
  const { orderCode } = useParams<{ orderCode: string }>();
  const navigate = useNavigate();
  const [currentUser] = useState(() => authService.getCurrentUser());
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Realtime Polling state
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [pollingActive, setPollingActive] = useState<boolean>(false);
  const [momoRedirecting, setMomoRedirecting] = useState<boolean>(false);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    if (!orderCode) {
      navigate('/');
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const res = await orderService.getOrderByCode(orderCode);
        if (!isMounted) return;

        if (res.success && res.data) {
          setOrder(res.data);
          const alreadyPaid = res.data.paymentStatus === 1; // Completed / Paid
          setIsPaid(alreadyPaid);

          // Nếu đơn hàng là thanh toán MoMo và chưa thanh toán
          if (res.data.paymentMethod === 3 && !alreadyPaid) {
            setPollingActive(true);
          }
        } else {
          setError('Không tìm thấy thông tin đơn hàng.');
        }
      } catch (e: unknown) {
        if (isMounted) setError(e instanceof Error ? e.message : 'Lỗi kết nối.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [orderCode, navigate]);

  // 2. Realtime Polling: Thăm dò trạng thái thanh toán mỗi 3 giây
  useEffect(() => {
    if (!pollingActive || !orderCode || isPaid) return;

    pollingRef.current = setInterval(async () => {
      try {
        const statusData = await paymentService.checkPaymentStatus(orderCode);
        if (statusData.isPaid) {
          setIsPaid(true);
          setPollingActive(false);
          // Cập nhật lại Order local state
          setOrder((prev) =>
            prev
              ? {
                  ...prev,
                  paymentStatus: 1,
                  orderStatus: prev.orderStatus === 0 ? 1 : prev.orderStatus,
                  paymentDate: statusData.paidAt ?? new Date().toISOString(),
                }
              : null
          );
        }
      } catch {
        // bỏ qua lỗi polling mạng ngắt quãng
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pollingActive, orderCode, isPaid]);

  const handleOpenMoMo = async () => {
    if (!orderCode || momoRedirecting) return;
    setMomoRedirecting(true);
    try {
      const res = await paymentService.createMoMoPayment(orderCode);
      if (res.success && res.payUrl) {
        window.location.href = res.payUrl;
      } else {
        alert(res.message || 'Không thể tạo phiên thanh toán MoMo.');
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Lỗi kết nối cổng MoMo.');
    } finally {
      setMomoRedirecting(false);
    }
  };

  if (loading) {
    return (
      <div style={S.loadingWrap}>
        <div style={S.spinner} />
        <p style={{ marginTop: 16, color: '#6a6a6a' }}>Đang tải đơn hàng…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={S.page}>
        <HomeHeader currentUser={currentUser} onLogout={() => {}} />
        <div style={S.centerWrap}>
          <p style={{ color: '#c13515', fontSize: 16 }}>{error ?? 'Đơn hàng không tồn tại.'}</p>
          <Link to="/" style={S.linkBtn}>Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const isMoMo = order.paymentMethod === 3;
  const statusMeta = orderStatusMeta[order.orderStatus] ?? orderStatusMeta[0];

  return (
    <div style={S.page}>
      <HomeHeader currentUser={currentUser} onLogout={() => authService.logout()} />

      <main style={S.main}>
        {/* ── Success banner ── */}
        <div style={S.successBanner}>
          <div style={isPaid ? S.checkIconSuccess : S.checkIcon}>
            {isPaid ? '✓' : '🎉'}
          </div>
          <div>
            <h1 style={S.successTitle}>
              {isPaid ? 'Thanh toán thành công!' : 'Đặt hàng thành công!'}
            </h1>
            <p style={S.successSub}>
              Cảm ơn bạn đã mua sắm tại ShopVibe. Mã đơn hàng của bạn là{' '}
              <strong style={{ color: '#ff385c' }}>#{order.orderCode}</strong>
            </p>
          </div>
        </div>

        <div style={S.grid}>
          {/* ── Left: Order details ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Status */}
            <section style={S.card}>
              <div style={S.statusRow}>
                <span style={{ fontSize: 14, color: '#6a6a6a' }}>Trạng thái đơn hàng</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {isMoMo && (
                    <span
                      style={{
                        ...S.badge,
                        color: isPaid ? '#15803d' : '#a21caf',
                        background: isPaid ? '#dcfce7' : '#fdf2f8',
                        border: isPaid ? '1px solid #bbf7d0' : '1px solid #fbcfe8',
                      }}
                    >
                      {isPaid ? '● Đã thanh toán MoMo' : '⏳ Chờ thanh toán MoMo'}
                    </span>
                  )}
                  <span style={{ ...S.badge, color: statusMeta.color, background: statusMeta.bg }}>
                    {statusMeta.label}
                  </span>
                </div>
              </div>
              <div style={S.metaGrid}>
                <div style={S.metaItem}>
                  <span style={S.metaLabel}>Mã đơn</span>
                  <span style={S.metaValue}>#{order.orderCode}</span>
                </div>
                <div style={S.metaItem}>
                  <span style={S.metaLabel}>Đặt lúc</span>
                  <span style={S.metaValue}>{formatDate(order.createdAt)}</span>
                </div>
                <div style={S.metaItem}>
                  <span style={S.metaLabel}>Phương thức</span>
                  <span style={S.metaValue}>{paymentMethodLabel[order.paymentMethod]}</span>
                </div>
                <div style={S.metaItem}>
                  <span style={S.metaLabel}>Người nhận</span>
                  <span style={S.metaValue}>{order.recipientName} · {order.recipientPhone}</span>
                </div>
                <div style={{ ...S.metaItem, gridColumn: '1 / -1' }}>
                  <span style={S.metaLabel}>Địa chỉ giao hàng</span>
                  <span style={S.metaValue}>{order.shippingAddress}</span>
                </div>
                {order.note && (
                  <div style={{ ...S.metaItem, gridColumn: '1 / -1' }}>
                    <span style={S.metaLabel}>Ghi chú</span>
                    <span style={S.metaValue}>{order.note}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Items */}
            <section style={S.card}>
              <h2 style={S.sectionTitle}>Sản phẩm đã đặt</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {order.orderItems.map((item) => (
                  <li key={item.orderItemId} style={S.itemRow}>
                    <div style={S.itemImgWrap}>
                      {item.productImageUrl ? (
                        <img src={item.productImageUrl} alt={item.productName} style={S.itemImg} />
                      ) : (
                        <div style={S.itemImgFallback}>🛍️</div>
                      )}
                      <span style={S.qtyBadge}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={S.itemName}>{item.productName}</p>
                      {item.variantInfo && <p style={S.itemVariant}>{item.variantInfo}</p>}
                      <p style={{ ...S.itemVariant, color: '#6a6a6a' }}>
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <p style={S.itemPrice}>{formatPrice(item.totalPrice)}</p>
                  </li>
                ))}
              </ul>

              <div style={S.divider} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={S.totalRow}>
                  <span>Tạm tính</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div style={S.totalRow}>
                  <span>Phí vận chuyển</span>
                  <span style={{ color: order.shippingFee === 0 ? '#00a699' : '#222' }}>
                    {order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div style={{ ...S.totalRow, color: '#00a699' }}>
                    <span>Giảm giá</span>
                    <span>−{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div style={S.divider} />
                <div style={{ ...S.totalRow, fontSize: 18, fontWeight: 700 }}>
                  <span>Tổng thanh toán</span>
                  <span style={{ color: '#ff385c' }}>{formatPrice(order.finalAmount)}</span>
                </div>
              </div>
            </section>
          </div>

          {/* ── Right: MoMo or COD info ── */}
          <aside style={{ position: 'sticky', top: 90 }}>
            {isMoMo ? (
              <section style={S.card}>
                {isPaid ? (
                  /* Giao diện khi ĐÃ THANH TOÁN THÀNH CÔNG */
                  <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                    <div style={S.paidCelebrationIcon}>✓</div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#15803d', margin: '12px 0 6px' }}>
                      Đã nhận thanh toán MoMo
                    </h2>
                    <p style={{ fontSize: 13, color: '#6a6a6a', margin: '0 0 16px', lineHeight: 1.5 }}>
                      Giao dịch qua Ví MoMo cho đơn hàng <strong>#{order.orderCode}</strong> đã hoàn tất thành công.
                      Đơn hàng đã được chuyển sang bộ phận đóng gói.
                    </p>
                    <div style={S.paidBadgeDetail}>
                      <span>Số tiền: <strong>{formatPrice(order.finalAmount)}</strong></span>
                      <span style={{ color: '#15803d', fontWeight: 600 }}>Hoàn tất</span>
                    </div>
                  </div>
                ) : (
                  /* Giao diện khi CHỜ THANH TOÁN MOMO */
                  <div style={{ textAlign: 'center', padding: '12px 6px' }}>
                    <div style={S.momoLogoWrap}>👛</div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#a21caf', margin: '10px 0 6px' }}>
                      Thanh toán qua Ví MoMo
                    </h2>
                    <p style={{ fontSize: 13, color: '#6a6a6a', margin: '0 0 16px', lineHeight: 1.5 }}>
                      Đơn hàng đang chờ thanh toán qua cổng Ví MoMo. Bạn có thể nhấn nút bên dưới để mở trang thanh toán MoMo.
                    </p>

                    <div style={{ ...S.paidBadgeDetail, marginBottom: 16 }}>
                      <span>Số tiền: <strong style={{ color: '#ff385c' }}>{formatPrice(order.finalAmount)}</strong></span>
                      <span style={{ color: '#b45309', fontWeight: 600 }}>Chờ thanh toán</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenMoMo}
                      disabled={momoRedirecting}
                      style={S.momoPayBtn}
                    >
                      {momoRedirecting ? 'Đang kết nối MoMo...' : '🚀 Mở cổng thanh toán MoMo ngay'}
                    </button>
                  </div>
                )}
              </section>
            ) : (
              <section style={S.card}>
                <div style={S.codIcon}>🚚</div>
                <h2 style={{ ...S.sectionTitle, justifyContent: 'center', marginTop: 10 }}>
                  Thanh toán khi nhận hàng
                </h2>
                <p style={{ fontSize: 14, color: '#6a6a6a', textAlign: 'center', lineHeight: 1.6 }}>
                  Vui lòng chuẩn bị sẵn số tiền{' '}
                  <strong style={{ color: '#ff385c' }}>{formatPrice(order.finalAmount)}</strong>{' '}
                  khi nhân viên giao hàng đến.
                </p>
                <div style={S.codTimeline}>
                  {['Chờ xác nhận', 'Đóng gói', 'Đang giao', 'Hoàn thành'].map((step, i) => (
                    <div key={i} style={S.timelineStep}>
                      <div style={{ ...S.timelineDot, ...(i === 0 ? S.timelineDotActive : {}) }}>
                        {i === 0 ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: 11, color: i === 0 ? '#ff385c' : '#6a6a6a', marginTop: 4 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              <Link to="/orders" style={S.btnPrimary}>
                Xem lịch sử đơn hàng
              </Link>
              <Link to="/" style={S.btnSecondary}>
                Tiếp tục mua sắm
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#f7f7f7', fontFamily: "'Inter', -apple-system, sans-serif", color: '#222' },
  main: { maxWidth: 1128, margin: '0 auto', padding: '28px 20px 80px', boxSizing: 'border-box' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' },
  loadingWrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 36, height: 36, border: '3px solid #ebebeb', borderTopColor: '#ff385c', borderRadius: '50%', animation: 'spin 600ms linear infinite' },
  centerWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16, minHeight: '60vh' },
  successBanner: {
    display: 'flex', alignItems: 'center', gap: 18, background: '#fff', border: '1px solid #ebebeb',
    borderRadius: 14, padding: '20px 24px', marginBottom: 24,
  },
  checkIcon: {
    width: 52, height: 52, borderRadius: '50%', background: '#dcfce7', color: '#15803d',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, flexShrink: 0,
  },
  checkIconSuccess: {
    width: 52, height: 52, borderRadius: '50%', background: '#15803d', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, flexShrink: 0,
    boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
  },
  simToast: {
    display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0',
    color: '#166534', padding: '12px 18px', borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 600,
    boxShadow: '0 2px 6px rgba(22, 101, 52, 0.08)',
  },
  liveBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#b45309',
    background: '#fef3c7', padding: '4px 10px', borderRadius: 9999, border: '1px solid #fde68a',
  },
  liveDot: {
    width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', animation: 'spin 1.5s infinite alternate',
  },
  paidCelebrationIcon: {
    width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#15803d',
    fontSize: 32, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto', boxShadow: '0 6px 16px rgba(21, 128, 61, 0.15)',
  },
  paidBadgeDetail: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc',
    border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', fontSize: 14,
  },
  simulateBtn: {
    width: '100%', padding: '10px 14px', background: '#f1f5f9', border: '1px dashed #94a3b8',
    borderRadius: 8, color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  successTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: '#222' },
  successSub: { margin: '4px 0 0', fontSize: 14, color: '#6a6a6a', lineHeight: 1.5 },
  card: { background: '#fff', border: '1px solid #ebebeb', borderRadius: 14, padding: '24px' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#222', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 },
  statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  metaItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  metaLabel: { fontSize: 12, color: '#6a6a6a' },
  metaValue: { fontSize: 14, fontWeight: 500, color: '#222' },
  divider: { height: 1, background: '#ebebeb', margin: '12px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#3f3f3f' },
  itemRow: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  itemImgWrap: { position: 'relative', flexShrink: 0 },
  itemImg: { width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #ebebeb' },
  itemImgFallback: { width: 60, height: 60, borderRadius: 8, background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid #ebebeb' },
  qtyBadge: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#222', color: '#fff', borderRadius: '50%', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemName: { margin: 0, fontSize: 14, fontWeight: 500, color: '#222', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemVariant: { margin: '3px 0 0', fontSize: 12, color: '#6a6a6a' },
  itemPrice: { margin: 0, fontSize: 14, fontWeight: 600, color: '#222', flexShrink: 0 },
  momoLogoWrap: {
    width: 64, height: 64, borderRadius: 20, background: '#fdf2f8', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 12px', border: '1px solid #fbcfe8',
  },
  momoPayBtn: {
    width: '100%', padding: '14px', background: '#a21caf', color: '#fff', border: 'none',
    borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 150ms ease',
    boxShadow: '0 2px 6px rgba(162, 28, 175, 0.25)',
  },
  // COD
  codIcon: { fontSize: 48, textAlign: 'center' },
  codTimeline: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20, padding: '0 10px' },
  timelineStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 },
  timelineDot: { width: 28, height: 28, borderRadius: '50%', background: '#ebebeb', color: '#6a6a6a', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  timelineDotActive: { background: '#ff385c', color: '#fff' },
  // CTAs
  btnPrimary: { display: 'block', textAlign: 'center', padding: '14px', background: '#ff385c', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' },
  btnSecondary: { display: 'block', textAlign: 'center', padding: '13px', background: '#fff', color: '#222', borderRadius: 8, fontWeight: 500, fontSize: 15, textDecoration: 'none', border: '1px solid #dddddd' },
  linkBtn: { padding: '12px 24px', background: '#ff385c', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none' },
};

// Spin keyframes
if (typeof document !== 'undefined' && !document.getElementById('__success_spin__')) {
  const s = document.createElement('style');
  s.id = '__success_spin__';
  s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}
