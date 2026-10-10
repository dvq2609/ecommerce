import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HomeHeader } from '../components/home/HomeHeader';
import { BottomNavBar } from '../components/home/BottomNavBar';
import { authService } from '../services/authService';
import { orderService, orderStatusMeta, paymentMethodLabel } from '../services/orderService';
import type { OrderResponse, OrderStatus } from '../types/order';

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

const TABS: { label: string; status?: OrderStatus }[] = [
  { label: 'Tất cả' },
  { label: 'Chờ xác nhận', status: 0 },
  { label: 'Đã xác nhận', status: 1 },
  { label: 'Đang giao', status: 3 },
  { label: 'Đã giao', status: 4 },
  { label: 'Đã hủy', status: 5 },
];

const CANCEL_REASONS = [
  'Tôi muốn thay đổi địa chỉ nhận hàng / số điện thoại',
  'Tôi muốn đổi biến thể khác (kích cỡ, màu sắc)',
  'Tôi đổi ý, không muốn mua nữa',
  'Tìm thấy giá tốt hơn ở nơi khác',
  'Lý do khác',
];

import { ReviewModal } from '../components/review/ReviewModal';

export const OrdersHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  // Filters & State
  const [activeTab, setActiveTab] = useState<OrderStatus | undefined>(undefined);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<OrderResponse | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    orderId: number;
    productId: number;
    productName: string;
    productImage?: string;
    productVariantId?: number;
    variantInfo?: string;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login?redirect=/orders');
    }
  }, [navigate]);

  // Load orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders({
        status: activeTab,
        pageSize: 50,
      });
      if (res.success && res.data) {
        setOrders(res.data.items);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle Cancel Order
  const handleConfirmCancel = async () => {
    if (!cancelTargetOrder) return;
    setCancelling(true);
    const finalReason = cancelReason === 'Lý do khác' && customReason.trim() ? customReason.trim() : cancelReason;

    try {
      const res = await orderService.cancelOrder(cancelTargetOrder.orderId, { reason: finalReason });
      if (res.success) {
        setActionMessage({ text: `Đã hủy đơn hàng #${cancelTargetOrder.orderCode} thành công.`, type: 'success' });
        setCancelTargetOrder(null);
        await fetchOrders();
      } else {
        setActionMessage({ text: res.message || 'Không thể hủy đơn hàng.', type: 'error' });
      }
    } catch (err: unknown) {
      setActionMessage({ text: err instanceof Error ? err.message : 'Lỗi khi hủy đơn hàng.', type: 'error' });
    } finally {
      setCancelling(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Filtered orders by client-side search
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchCode = o.orderCode.toLowerCase().includes(q);
    const matchItem = o.orderItems.some((item) => item.productName.toLowerCase().includes(q));
    return matchCode || matchItem;
  });

  return (
    <div style={styles.page}>
      <HomeHeader
        currentUser={currentUser}
        onLogout={() => {
          authService.logout();
          setCurrentUser(null);
          navigate('/login');
        }}
      />

      <main style={styles.main}>
        {/* Page Title & Breadcrumb */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.pageTitle}>Đơn mua của tôi</h1>
            <p style={styles.pageSubtitle}>Theo dõi và quản lý lịch sử mua sắm của bạn tại ShopVibe</p>
          </div>
          <Link to="/" style={styles.continueShopBtn}>
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {/* Action toast message */}
        {actionMessage && (
          <div
            style={{
              ...styles.toast,
              backgroundColor: actionMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              borderColor: actionMessage.type === 'success' ? '#bbf7d0' : '#fecaca',
              color: actionMessage.type === 'success' ? '#166534' : '#991b1b',
            }}
          >
            <span>{actionMessage.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div style={styles.tabsTrack}>
          {TABS.map((t) => {
            const isActive = activeTab === t.status;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setActiveTab(t.status)}
                style={{
                  ...styles.tabBtn,
                  ...(isActive ? styles.tabBtnActive : {}),
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div style={styles.searchBox}>
          <span className="material-symbols-outlined" style={styles.searchIcon}>
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo Mã đơn hàng hoặc Tên sản phẩm…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              aria-label="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content list */}
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={{ marginTop: 12, color: '#6a6a6a', fontSize: 14 }}>Đang tải danh sách đơn hàng…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>📦</div>
            <h2 style={styles.emptyTitle}>
              {searchQuery ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
            </h2>
            <p style={styles.emptySubtitle}>
              {searchQuery
                ? 'Thử kiểm tra lại từ khóa tìm kiếm hoặc chọn danh mục trạng thái khác.'
                : 'Bạn chưa có đơn hàng nào trong mục này. Hãy khám phá các bộ sưu tập thời trang mới nhất!'}
            </p>
            <Link to="/" style={styles.emptyBtn}>
              Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div style={styles.orderList}>
            {filteredOrders.map((order) => {
              const statusMeta = orderStatusMeta[order.orderStatus] ?? orderStatusMeta[0];
              const canCancel = order.orderStatus === 0 || order.orderStatus === 1;

              return (
                <article key={order.orderId} style={styles.orderCard}>
                  {/* Card Header */}
                  <div style={styles.orderCardHeader}>
                    <div style={styles.orderMetaLeft}>
                      <span style={styles.orderCodeBadge}>#{order.orderCode}</span>
                      <span style={styles.orderDate}>Đặt lúc {formatDate(order.createdAt)}</span>
                    </div>

                    <div style={styles.orderMetaRight}>
                      {order.paymentMethod === 3 && (
                        <span
                          style={{
                            ...styles.statusBadge,
                            color: order.paymentStatus === 1 ? '#15803d' : '#a21caf',
                            backgroundColor: order.paymentStatus === 1 ? '#dcfce7' : '#fdf2f8',
                            border: order.paymentStatus === 1 ? '1px solid #bbf7d0' : '1px solid #fbcfe8',
                          }}
                        >
                          {order.paymentStatus === 1 ? '● Đã thanh toán MoMo' : '⏳ Chờ thanh toán MoMo'}
                        </span>
                      )}
                      <span
                        style={{
                          ...styles.statusBadge,
                          color: statusMeta.color,
                          backgroundColor: statusMeta.bg,
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={styles.itemsWrapper}>
                    {order.orderItems.map((item) => (
                      <div key={item.orderItemId} style={styles.itemRow}>
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl} alt={item.productName} style={styles.itemImg} />
                        ) : (
                          <div style={styles.itemImgFallback}>🛍️</div>
                        )}

                        <div style={styles.itemDetails}>
                          <h3 style={styles.itemName}>{item.productName}</h3>
                          {item.variantInfo && <p style={styles.itemVariant}>Phân loại: {item.variantInfo}</p>}
                          <p style={styles.itemQty}>Số lượng: x{item.quantity}</p>
                        </div>

                        <div style={styles.itemPriceCol}>
                          <span style={styles.itemPrice}>{formatPrice(item.totalPrice)}</span>
                          {order.orderStatus === 4 && (
                            <button
                              type="button"
                              style={{
                                marginTop: '6px',
                                padding: '5px 12px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#d97706',
                                backgroundColor: '#fffbeb',
                                border: '1px solid #fde68a',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              onClick={() => {
                                setReviewTarget({
                                  orderId: order.orderId,
                                  productId: item.productId,
                                  productName: item.productName,
                                  productImage: item.productImageUrl || undefined,
                                  productVariantId: item.productVariantId || undefined,
                                  variantInfo: item.variantInfo || undefined,
                                });
                              }}
                            >
                              ⭐ Đánh giá
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div style={styles.orderCardFooter}>
                    <div style={styles.footerLeft}>
                      <span style={styles.paymentMethodText}>
                        Phương thức: <strong>{paymentMethodLabel[order.paymentMethod] || 'COD'}</strong>
                      </span>
                      {order.shippingFee === 0 && (
                        <span style={styles.freeShipTag}>Miễn phí giao hàng</span>
                      )}
                    </div>

                    <div style={styles.footerRight}>
                      <div style={styles.totalRow}>
                        <span style={styles.totalLabel}>Tổng thanh toán:</span>
                        <strong style={styles.totalValue}>{formatPrice(order.finalAmount)}</strong>
                      </div>

                      <div style={styles.actionBtns}>
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelTargetOrder(order);
                              setCancelReason(CANCEL_REASONS[0]);
                              setCustomReason('');
                            }}
                            style={styles.cancelBtn}
                          >
                            Hủy đơn hàng
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          style={styles.detailBtn}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ════════════ MODAL: CHI TIẾT ĐƠN HÀNG ════════════ */}
      {selectedOrder && (
        <div style={styles.modalBackdrop} onClick={() => setSelectedOrder(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Chi tiết đơn hàng</h2>
                <p style={styles.modalSub}>Mã đơn #{selectedOrder.orderCode}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={styles.closeBtn}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Delivery info */}
              <div style={styles.infoCard}>
                <h4 style={styles.infoSectionTitle}>📍 Thông tin giao hàng</h4>
                <p style={styles.infoRow}>
                  <span style={styles.infoLabel}>Người nhận:</span>
                  <strong>{selectedOrder.recipientName}</strong>
                </p>
                <p style={styles.infoRow}>
                  <span style={styles.infoLabel}>Số điện thoại:</span>
                  <strong>{selectedOrder.recipientPhone}</strong>
                </p>
                <p style={styles.infoRow}>
                  <span style={styles.infoLabel}>Địa chỉ nhận:</span>
                  <span>{selectedOrder.shippingAddress}</span>
                </p>
                {selectedOrder.note && (
                  <p style={styles.infoRow}>
                    <span style={styles.infoLabel}>Ghi chú:</span>
                    <span style={{ fontStyle: 'italic', color: '#6a6a6a' }}>{selectedOrder.note}</span>
                  </p>
                )}
              </div>

              {/* Items detail */}
              <div style={styles.infoCard}>
                <h4 style={styles.infoSectionTitle}>🛍️ Danh sách món</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.orderItemId} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {item.productImageUrl ? (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 6, background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          🛍️
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#222' }}>{item.productName}</p>
                        {item.variantInfo && (
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6a6a6a' }}>{item.variantInfo}</p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>{formatPrice(item.totalPrice)}</div>
                        <div style={{ fontSize: 11, color: '#6a6a6a' }}>x{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div style={styles.infoCard}>
                <h4 style={styles.infoSectionTitle}>💳 Thông tin thanh toán</h4>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Phương thức:</span>
                  <strong>{paymentMethodLabel[selectedOrder.paymentMethod]}</strong>
                </div>
                {selectedOrder.paymentMethod === 3 && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Trạng thái TT:</span>
                    <strong style={{ color: selectedOrder.paymentStatus === 1 ? '#15803d' : '#a21caf' }}>
                      {selectedOrder.paymentStatus === 1 ? 'Đã thanh toán qua MoMo' : 'Đang chờ thanh toán MoMo'}
                    </strong>
                  </div>
                )}
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Tạm tính:</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Phí giao hàng:</span>
                  <span>{selectedOrder.shippingFee === 0 ? 'Miễn phí' : formatPrice(selectedOrder.shippingFee)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Giảm giá:</span>
                    <span style={{ color: '#00a699' }}>-{formatPrice(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div style={{ height: 1, background: '#ebebeb', margin: '8px 0' }} />
                <div style={{ ...styles.infoRow, fontSize: 15 }}>
                  <span style={{ fontWeight: 700, color: '#222' }}>Tổng cộng:</span>
                  <strong style={{ color: '#ff385c', fontSize: 16 }}>{formatPrice(selectedOrder.finalAmount)}</strong>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              {selectedOrder.paymentMethod === 3 && selectedOrder.paymentStatus === 0 && (
                <Link
                  to={`/order-success/${selectedOrder.orderCode}`}
                  style={styles.modalQrBtn}
                  onClick={() => setSelectedOrder(null)}
                >
                  Thanh toán MoMo ngay
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={styles.modalCloseBtn}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ MODAL: XÁC NHẬN HỦY ĐƠN ════════════ */}
      {cancelTargetOrder && (
        <div style={styles.modalBackdrop} onClick={() => !cancelling && setCancelTargetOrder(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ ...styles.modalTitle, color: '#c13515' }}>Hủy đơn hàng</h2>
                <p style={styles.modalSub}>Mã đơn #{cancelTargetOrder.orderCode}</p>
              </div>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelTargetOrder(null)}
                style={styles.closeBtn}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ fontSize: 14, color: '#3f3f3f', margin: '0 0 16px', lineHeight: 1.5 }}>
                Vui lòng chọn lý do bạn muốn hủy đơn hàng này. Sau khi hủy, số lượng sản phẩm sẽ được hoàn lại vào kho.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CANCEL_REASONS.map((reason) => (
                  <label
                    key={reason}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: cancelReason === reason ? '2px solid #222222' : '1px solid #dddddd',
                      cursor: 'pointer',
                      fontSize: 14,
                      backgroundColor: cancelReason === reason ? '#fafafa' : '#ffffff',
                    }}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={() => setCancelReason(reason)}
                      style={{ accentColor: '#ff385c' }}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReason === 'Lý do khác' && (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    rows={3}
                    placeholder="Nhập lý do cụ thể của bạn…"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 8,
                      border: '1px solid #dddddd',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelTargetOrder(null)}
                style={styles.modalCancelBtn}
              >
                Không, giữ lại đơn
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                style={{
                  ...styles.modalConfirmBtn,
                  ...(cancelling ? { opacity: 0.7, cursor: 'not-allowed' } : {}),
                }}
              >
                {cancelling ? 'Đang hủy…' : 'Xác nhận hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ MODAL: ĐÁNH GIÁ SẢN PHẨM ════════════ */}
      {reviewTarget && (
        <ReviewModal
          orderId={reviewTarget.orderId}
          productId={reviewTarget.productId}
          productName={reviewTarget.productName}
          productImage={reviewTarget.productImage}
          productVariantId={reviewTarget.productVariantId}
          variantInfo={reviewTarget.variantInfo}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => {
            setReviewTarget(null);
            setActionMessage({
              text: 'Cảm ơn bạn! Đánh giá sản phẩm đã được gửi thành công.',
              type: 'success',
            });
            setTimeout(() => setActionMessage(null), 4000);
          }}
        />
      )}

      <BottomNavBar />
    </div>
  );
};

// ─── Airbnb Styles ────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f7f7f7',
    fontFamily: "'Inter', 'DM Sans', -apple-system, sans-serif",
    color: '#222222',
  },
  main: {
    maxWidth: 980,
    margin: '0 auto',
    padding: '28px 16px 80px',
    boxSizing: 'border-box',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: '#222222',
    letterSpacing: '-0.3px',
  },
  pageSubtitle: {
    margin: '4px 0 0',
    fontSize: 14,
    color: '#6a6a6a',
  },
  continueShopBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #dddddd',
    backgroundColor: '#ffffff',
    color: '#222222',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    transition: 'background-color 150ms ease-out',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 18px',
    borderRadius: 8,
    border: '1px solid',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 16,
  },
  tabsTrack: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
    marginBottom: 16,
  },
  tabBtn: {
    padding: '8px 18px',
    borderRadius: 9999,
    border: '1px solid #dddddd',
    backgroundColor: '#ffffff',
    color: '#6a6a6a',
    fontSize: 13.5,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 150ms ease-out',
  },
  tabBtnActive: {
    backgroundColor: '#222222',
    color: '#ffffff',
    borderColor: '#222222',
    fontWeight: 600,
  },
  searchBox: {
    position: 'relative',
    marginBottom: 20,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 20,
    color: '#6a6a6a',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: 46,
    padding: '0 40px 0 44px',
    borderRadius: 8,
    border: '1px solid #dddddd',
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#222222',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border 200ms ease',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'none',
    fontSize: 16,
    color: '#6a6a6a',
    cursor: 'pointer',
  },
  loadingBox: {
    minHeight: 240,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    border: '1px solid #ebebeb',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #ebebeb',
    borderTopColor: '#ff385c',
    borderRadius: '50%',
    animation: 'spin 600ms linear infinite',
  },
  emptyCard: {
    padding: '56px 24px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    border: '1px solid #ebebeb',
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#222222',
    margin: '0 0 6px',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6a6a6a',
    maxWidth: 420,
    margin: '0 auto 20px',
    lineHeight: 1.5,
  },
  emptyBtn: {
    display: 'inline-block',
    padding: '11px 22px',
    backgroundColor: '#ff385c',
    color: '#ffffff',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: 'none',
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #ebebeb',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
  },
  orderMetaLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  orderCodeBadge: {
    fontSize: 13.5,
    fontWeight: 700,
    color: '#222222',
  },
  orderDate: {
    fontSize: 12.5,
    color: '#6a6a6a',
  },
  orderMetaRight: {},
  statusBadge: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12.5,
    fontWeight: 600,
  },
  itemsWrapper: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  itemImg: {
    width: 64,
    height: 64,
    borderRadius: 8,
    objectFit: 'cover',
    border: '1px solid #ebebeb',
    flexShrink: 0,
  },
  itemImgFallback: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 26,
    border: '1px solid #ebebeb',
    flexShrink: 0,
  },
  itemDetails: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: '#222222',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemVariant: {
    margin: '3px 0 0',
    fontSize: 12,
    color: '#6a6a6a',
  },
  itemQty: {
    margin: '2px 0 0',
    fontSize: 12,
    color: '#6a6a6a',
  },
  itemPriceCol: {
    textAlign: 'right',
    flexShrink: 0,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 600,
    color: '#222222',
  },
  orderCardFooter: {
    padding: '14px 20px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#ffffff',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  paymentMethodText: {
    fontSize: 12.5,
    color: '#6a6a6a',
  },
  freeShipTag: {
    fontSize: 11,
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '2px 8px',
    borderRadius: 4,
    fontWeight: 600,
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  totalRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
  },
  totalLabel: {
    fontSize: 13,
    color: '#6a6a6a',
  },
  totalValue: {
    fontSize: 16,
    color: '#ff385c',
  },
  actionBtns: {
    display: 'flex',
    gap: 8,
  },
  cancelBtn: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid #dddddd',
    backgroundColor: '#ffffff',
    color: '#c13515',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  detailBtn: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid #222222',
    backgroundColor: '#222222',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
  },

  // Modal styles
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    maxWidth: 500,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '18px 22px',
    borderBottom: '1px solid #ebebeb',
  },
  modalTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: '#222222',
  },
  modalSub: {
    margin: '3px 0 0',
    fontSize: 13,
    color: '#6a6a6a',
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    fontSize: 18,
    color: '#6a6a6a',
    cursor: 'pointer',
    padding: 4,
  },
  modalBody: {
    padding: '18px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  infoCard: {
    padding: '12px 14px',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  infoSectionTitle: {
    margin: '0 0 4px',
    fontSize: 13,
    fontWeight: 700,
    color: '#222222',
  },
  infoRow: {
    margin: 0,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: '#3f3f3f',
    gap: 8,
  },
  infoLabel: {
    color: '#6a6a6a',
    flexShrink: 0,
  },
  modalFooter: {
    padding: '14px 22px',
    borderTop: '1px solid #ebebeb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalQrBtn: {
    padding: '9px 16px',
    borderRadius: 8,
    backgroundColor: '#ff385c',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  },
  modalCloseBtn: {
    padding: '9px 18px',
    borderRadius: 8,
    border: '1px solid #dddddd',
    backgroundColor: '#ffffff',
    color: '#222222',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  modalCancelBtn: {
    padding: '9px 16px',
    borderRadius: 8,
    border: '1px solid #dddddd',
    backgroundColor: '#ffffff',
    color: '#6a6a6a',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  modalConfirmBtn: {
    padding: '9px 18px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#c13515',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
