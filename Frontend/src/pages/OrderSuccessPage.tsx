import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { orderService, orderStatusMeta, paymentMethodLabel } from '../services/orderService';
import { HomeHeader } from '../components/home/HomeHeader';
import { authService } from '../services/authService';
import type { OrderResponse } from '../types/order';

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

// ── VietQR helper ─────────────────────────────────────────────────────────────
// Dùng QR tĩnh demo (thực tế trỏ đến tài khoản merchant)
const VIETQR_BANK = 'MB';
const VIETQR_ACCOUNT = '0123456789';
const VIETQR_TEMPLATE = 'compact2';

function buildVietQRUrl(amount: number, orderCode: string) {
  const base = `https://img.vietqr.io/image/${VIETQR_BANK}-${VIETQR_ACCOUNT}-${VIETQR_TEMPLATE}.png`;
  const params = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: `SHOPVIBE ${orderCode}`,
    accountName: 'SHOPVIBE STORE',
  });
  return `${base}?${params}`;
}

// ─── component ────────────────────────────────────────────────────────────────
export const OrderSuccessPage: React.FC = () => {
  const { orderCode } = useParams<{ orderCode: string }>();
  const navigate = useNavigate();
  const [currentUser] = useState(() => authService.getCurrentUser());
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderCode) { navigate('/'); return; }
    (async () => {
      try {
        const res = await orderService.getOrderByCode(orderCode);
        if (res.success) setOrder(res.data);
        else setError('Không tìm thấy thông tin đơn hàng.');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Lỗi kết nối.');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderCode, navigate]);

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

  const isBankTransfer = order.paymentMethod === 1;
  const statusMeta = orderStatusMeta[order.orderStatus] ?? orderStatusMeta[0];

  return (
    <div style={S.page}>
      <HomeHeader currentUser={currentUser} onLogout={() => authService.logout()} />

      <main style={S.main}>
        {/* ── Success banner ── */}
        <div style={S.successBanner}>
          <div style={S.checkIcon}>✓</div>
          <div>
            <h1 style={S.successTitle}>Đặt hàng thành công!</h1>
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
                <span style={{ ...S.badge, color: statusMeta.color, background: statusMeta.bg }}>
                  {statusMeta.label}
                </span>
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
                  <span style={S.metaLabel}>Thanh toán</span>
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

          {/* ── Right: VietQR or COD info ── */}
          <aside style={{ position: 'sticky', top: 90 }}>
            {isBankTransfer ? (
              <section style={S.card}>
                <h2 style={S.sectionTitle}>Quét mã VietQR để thanh toán</h2>
                <div style={S.qrWrap}>
                  <img
                    src={buildVietQRUrl(order.finalAmount, order.orderCode)}
                    alt="VietQR"
                    style={S.qrImg}
                    loading="lazy"
                  />
                </div>
                <div style={S.qrInfoBox}>
                  <p style={S.qrInfoRow}>
                    <span style={S.qrInfoLabel}>Ngân hàng</span>
                    <strong>MB Bank</strong>
                  </p>
                  <p style={S.qrInfoRow}>
                    <span style={S.qrInfoLabel}>Số tài khoản</span>
                    <strong>{VIETQR_ACCOUNT}</strong>
                  </p>
                  <p style={S.qrInfoRow}>
                    <span style={S.qrInfoLabel}>Số tiền</span>
                    <strong style={{ color: '#ff385c' }}>{formatPrice(order.finalAmount)}</strong>
                  </p>
                  <p style={S.qrInfoRow}>
                    <span style={S.qrInfoLabel}>Nội dung CK</span>
                    <strong>SHOPVIBE {order.orderCode}</strong>
                  </p>
                </div>
                <p style={{ fontSize: 12, color: '#6a6a6a', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                  Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán (trong vòng 15 phút).
                </p>
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
  // VietQR
  qrWrap: { display: 'flex', justifyContent: 'center', marginBottom: 16 },
  qrImg: { width: 200, height: 200, borderRadius: 12, border: '1px solid #ebebeb' },
  qrInfoBox: { background: '#f7f7f7', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
  qrInfoRow: { margin: 0, display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#3f3f3f' },
  qrInfoLabel: { color: '#6a6a6a', fontWeight: 400 },
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
