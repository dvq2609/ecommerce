import React, { useState, useEffect, useCallback } from 'react';
import { AdminSellerLayout } from '../components/layout/AdminSellerLayout';
import {
  adminOrderService,
  adminOrderStatusMeta,
  adminPaymentStatusMeta,
} from '../services/adminOrderService';
import type {
  AdminOrderDetail,
  AdminOrderStats,
  AdminOrderQuery,
} from '../types/adminOrder';
import type { OrderStatus, PaymentStatus } from '../types/order';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const dateStr = isoString.endsWith('Z') || isoString.includes('+') ? isoString : `${isoString}Z`;
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const STATUS_TABS: { label: string; status?: OrderStatus }[] = [
  { label: 'Tất cả' },
  { label: 'Chờ xác nhận', status: 0 },
  { label: 'Đã xác nhận', status: 1 },
  { label: 'Đang đóng gói', status: 2 },
  { label: 'Đang giao hàng', status: 3 },
  { label: 'Đã giao thành công', status: 4 },
  { label: 'Đã hủy', status: 5 },
  { label: 'Đã hoàn tiền', status: 6 },
];

export const AdminOrdersPage: React.FC = () => {
  // ─── Data State ─────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<AdminOrderDetail[]>([]);
  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // ─── Query / Filter State ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<number>(0); // index in STATUS_TABS
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const pageSize = 10;

  // ─── Detail Modal State ────────────────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ─── Fetch Data ────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const query: AdminOrderQuery = {
        pageNumber,
        pageSize,
        search: searchKeyword.trim() || undefined,
        status: STATUS_TABS[activeTab].status,
        paymentMethod: paymentMethodFilter !== '' ? (Number(paymentMethodFilter) as any) : undefined,
        paymentStatus: paymentStatusFilter !== '' ? (Number(paymentStatusFilter) as any) : undefined,
      };

      const [ordersRes, statsRes] = await Promise.all([
        adminOrderService.getOrders(query),
        adminOrderService.getStats(),
      ]);

      if (ordersRes && ordersRes.data) {
        setOrders(ordersRes.data.items || []);
        setTotalCount(ordersRes.data.totalCount || 0);
        setTotalPages(ordersRes.data.totalPages || 1);
      }

      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchKeyword, paymentMethodFilter, paymentStatusFilter, pageNumber]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleQuickStatusChange = async (orderId: number, newStatus: OrderStatus, reason?: string) => {
    try {
      setUpdatingStatus(true);
      const res = await adminOrderService.updateOrderStatus(orderId, {
        newStatus,
        note: reason || undefined,
      });

      if (res && res.success) {
        setFeedbackMsg({ type: 'success', text: `Cập nhật trạng thái thành công!` });
        // Refresh item in list & modal
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? res.data : o)));
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder(res.data);
        }
        // Refresh KPI stats
        const statsRes = await adminOrderService.getStats();
        if (statsRes?.data) setStats(statsRes.data);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Lỗi khi cập nhật trạng thái đơn.' });
    } finally {
      setUpdatingStatus(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: number, newPaymentStatus: PaymentStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await adminOrderService.updatePaymentStatus(orderId, {
        newPaymentStatus,
      });

      if (res && res.success) {
        setFeedbackMsg({ type: 'success', text: 'Cập nhật trạng thái thanh toán thành công!' });
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? res.data : o)));
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder(res.data);
        }
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Lỗi khi cập nhật thanh toán.' });
    } finally {
      setUpdatingStatus(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  return (
    <AdminSellerLayout
      title="Quản Lý Đơn Hàng"
      subtitle="Theo dõi, duyệt đơn, bàn giao vận chuyển và quản trị trạng thái toàn sàn"
    >
      {/* ─── FEEDBACK TOAST ─────────────────────────────────────────────────── */}
      {feedbackMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: feedbackMsg.type === 'success' ? '#15803d' : '#b91c1c',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {feedbackMsg.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ─── 1. KPI STATS CARDS ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={cardKpiStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#6a6a6a', fontWeight: 600 }}>TỔNG ĐƠN HÀNG</span>
            <span className="material-symbols-outlined" style={{ color: '#ff385c', fontSize: '22px' }}>
              receipt_long
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#222222', marginTop: '8px' }}>
            {stats?.totalOrders ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>Toàn bộ đơn hàng ghi nhận</div>
        </div>

        <div style={{ ...cardKpiStyle, borderLeft: '4px solid #b45309' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#b45309', fontWeight: 600 }}>CHỜ DUYỆT (PENDING)</span>
            <span className="material-symbols-outlined" style={{ color: '#b45309', fontSize: '22px' }}>
              pending_actions
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#b45309', marginTop: '8px' }}>
            {stats?.pendingOrders ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: '#6a6a6a', marginTop: '4px' }}>Cần xử lý & xác nhận ngay</div>
        </div>

        <div style={{ ...cardKpiStyle, borderLeft: '4px solid #0369a1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 600 }}>ĐANG GIAO HÀNG</span>
            <span className="material-symbols-outlined" style={{ color: '#0369a1', fontSize: '22px' }}>
              local_shipping
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0369a1', marginTop: '8px' }}>
            {stats?.shippingOrders ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: '#6a6a6a', marginTop: '4px' }}>Đang trên đường vận chuyển</div>
        </div>

        <div style={{ ...cardKpiStyle, borderLeft: '4px solid #15803d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>DOANH THU THỰC TẾ</span>
            <span className="material-symbols-outlined" style={{ color: '#15803d', fontSize: '22px' }}>
              payments
            </span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#15803d', marginTop: '8px' }}>
            {formatCurrency(stats?.totalRevenue ?? 0)}
          </div>
          <div style={{ fontSize: '12px', color: '#6a6a6a', marginTop: '4px' }}>
            {stats?.deliveredOrders ?? 0} đơn giao thành công
          </div>
        </div>
      </div>

      {/* ─── 2. STATUS TABS ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
        }}
      >
        {STATUS_TABS.map((tab, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveTab(idx);
                setPageNumber(1);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                border: isActive ? '1px solid #ff385c' : '1px solid #ebebeb',
                backgroundColor: isActive ? '#fff1f3' : '#ffffff',
                color: isActive ? '#ff385c' : '#4b5563',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 150ms ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── 3. SEARCH & FILTER CONTROLS ────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #ebebeb',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1 }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                fontSize: '20px',
              }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Tìm theo mã đơn #ORD, người nhận, SĐT, Email..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setPageNumber(1)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 40px',
                borderRadius: '8px',
                border: '1px solid #dddddd',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={paymentMethodFilter}
            onChange={(e) => {
              setPaymentMethodFilter(e.target.value);
              setPageNumber(1);
            }}
            style={selectControlStyle}
          >
            <option value="">Phương thức TT</option>
            <option value="0">COD (Tiền mặt)</option>
            <option value="2">Ví MoMo</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPageNumber(1);
            }}
            style={selectControlStyle}
          >
            <option value="">Trạng thái TT</option>
            <option value="0">Chờ thanh toán</option>
            <option value="1">Đã thanh toán</option>
            <option value="2">Thanh toán thất bại</option>
          </select>

          <button
            type="button"
            onClick={() => fetchOrders()}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #dddddd',
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              refresh
            </span>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* ─── 4. ORDERS DATA TABLE ───────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #ebebeb',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #ebebeb', color: '#6b7280' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>MÃ ĐƠN HÀNG</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>KHÁCH HÀNG</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SẢN PHẨM</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>TỔNG TIỀN</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>THANH TOÁN</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>TRẠNG THÁI</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</div> Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusMeta = adminOrderStatusMeta[order.orderStatus] || adminOrderStatusMeta[0];
                  const payStatusMeta = adminPaymentStatusMeta[order.paymentStatus] || adminPaymentStatusMeta[0];

                  return (
                    <tr
                      key={order.orderId}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background 100ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      {/* Mã đơn */}
                      <td style={{ padding: '14px 16px' }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#ff385c',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedOrder(order)}
                        >
                          #{order.orderCode}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '2px' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{order.recipientName}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{order.recipientPhone}</div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#9ca3af',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={order.shippingAddress}
                        >
                          {order.shippingAddress}
                        </div>
                      </td>

                      {/* Sản phẩm */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {order.orderItems?.[0]?.productImageUrl ? (
                            <img
                              src={order.orderItems[0].productImageUrl}
                              alt="thumb"
                              style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          ) : (
                            <div style={{ width: '38px', height: '38px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 500, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.orderItems?.[0]?.productName || 'Đơn hàng'}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#6b7280' }}>
                              {order.orderItems?.length || 0} sản phẩm
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{formatCurrency(order.finalAmount)}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>Ship: {formatCurrency(order.shippingFee)}</div>
                      </td>

                      {/* Thanh toán */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>
                          {order.paymentMethod === 0 ? '🚚 COD' : '👛 MoMo'}
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: payStatusMeta.bg,
                            color: payStatusMeta.color,
                            border: `1px solid ${payStatusMeta.border}`,
                          }}
                        >
                          {payStatusMeta.label}
                        </span>
                      </td>

                      {/* Trạng thái đơn */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '16px',
                            backgroundColor: statusMeta.bg,
                            color: statusMeta.color,
                            border: `1px solid ${statusMeta.border}`,
                          }}
                        >
                          <span>{statusMeta.icon}</span>
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            style={actionBtnStyle}
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                              visibility
                            </span>
                          </button>

                          {/* Quick action buttons according to status */}
                          {order.orderStatus === 0 && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(order.orderId, 1)}
                              style={{ ...actionBtnStyle, backgroundColor: '#dbeafe', color: '#1d4ed8' }}
                              title="Xác nhận đơn"
                              disabled={updatingStatus}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                check
                              </span>
                            </button>
                          )}

                          {order.orderStatus === 1 && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(order.orderId, 2)}
                              style={{ ...actionBtnStyle, backgroundColor: '#ede9fe', color: '#6d28d9' }}
                              title="Bắt đầu đóng gói"
                              disabled={updatingStatus}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                package_2
                              </span>
                            </button>
                          )}

                          {order.orderStatus === 2 && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(order.orderId, 3)}
                              style={{ ...actionBtnStyle, backgroundColor: '#e0f2fe', color: '#0369a1' }}
                              title="Giao shipper"
                              disabled={updatingStatus}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                local_shipping
                              </span>
                            </button>
                          )}

                          {order.orderStatus === 3 && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(order.orderId, 4)}
                              style={{ ...actionBtnStyle, backgroundColor: '#dcfce7', color: '#15803d' }}
                              title="Xác nhận giao thành công"
                              disabled={updatingStatus}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                task_alt
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Footer ──────────────────────────────────────────────── */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #ebebeb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          <div>
            Hiển thị <strong>{orders.length}</strong> / <strong>{totalCount}</strong> đơn hàng
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #dddddd',
                backgroundColor: pageNumber <= 1 ? '#f3f4f6' : '#ffffff',
                cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Trang trước
            </button>
            <span>
              Trang {pageNumber} / {totalPages}
            </span>
            <button
              type="button"
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #dddddd',
                backgroundColor: pageNumber >= totalPages ? '#f3f4f6' : '#ffffff',
                cursor: pageNumber >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      {/* ─── 5. ORDER DETAIL MODAL / DRAWER ─────────────────────────────────── */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #ebebeb', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111827' }}>
                    Chi Tiết Đơn Hàng #{selectedOrder.orderCode}
                  </h2>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '2px 10px',
                      borderRadius: '12px',
                      backgroundColor: adminOrderStatusMeta[selectedOrder.orderStatus]?.bg,
                      color: adminOrderStatusMeta[selectedOrder.orderStatus]?.color,
                    }}
                  >
                    {selectedOrder.orderStatusName}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                  Thời gian tạo đơn: {formatDate(selectedOrder.createdAt)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  close
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {/* Recipient info */}
              <div style={infoBoxStyle}>
                <h3 style={infoTitleStyle}>👤 THÔNG TIN NGƯỜI NHẬN</h3>
                <div style={{ fontSize: '13.5px', lineHeight: 1.7, color: '#374151' }}>
                  <div><strong>Họ tên:</strong> {selectedOrder.recipientName}</div>
                  <div><strong>Số điện thoại:</strong> {selectedOrder.recipientPhone}</div>
                  <div><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</div>
                  {selectedOrder.note && (
                    <div style={{ color: '#b45309', marginTop: '4px' }}>
                      <strong>Ghi chú của khách:</strong> {selectedOrder.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Account & Payment info */}
              <div style={infoBoxStyle}>
                <h3 style={infoTitleStyle}>💳 TÀI KHOẢN & THANH TOÁN</h3>
                <div style={{ fontSize: '13.5px', lineHeight: 1.7, color: '#374151' }}>
                  <div><strong>Tài khoản đặt:</strong> {selectedOrder.customerName || 'Khách vãng lai'}</div>
                  <div><strong>Email:</strong> {selectedOrder.customerEmail || '—'}</div>
                  <div><strong>Hình thức:</strong> {selectedOrder.paymentMethodName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <strong>Trạng thái TT:</strong>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => handleUpdatePaymentStatus(selectedOrder.orderId, Number(e.target.value) as PaymentStatus)}
                      disabled={updatingStatus}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #dddddd', fontSize: '12.5px' }}
                    >
                      <option value="0">Chờ thanh toán</option>
                      <option value="1">Đã thanh toán</option>
                      <option value="2">Thất bại</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product items table */}
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ ...infoTitleStyle, marginBottom: '10px' }}>🛍️ SẢN PHẨM TRONG ĐƠN ({selectedOrder.orderItems.length})</h3>
              <div style={{ border: '1px solid #ebebeb', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #ebebeb', color: '#6b7280' }}>
                      <th style={{ padding: '10px 14px' }}>Sản phẩm</th>
                      <th style={{ padding: '10px 14px' }}>Phân loại</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Đơn giá</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>SL</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderItems.map((item) => (
                      <tr key={item.orderItemId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {item.productImageUrl && (
                            <img src={item.productImageUrl} alt={item.productName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          )}
                          <span style={{ fontWeight: 600 }}>{item.productName}</span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#6b7280' }}>
                          {item.variantInfo || 'Tiêu chuẩn'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#ff385c' }}>
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Price Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <div style={{ width: '280px', fontSize: '13.5px', lineHeight: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                  <span>Tạm tính hàng:</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ebebeb', paddingTop: '6px', fontWeight: 700, fontSize: '16px', color: '#ff385c' }}>
                  <span>Tổng thanh toán:</span>
                  <span>{formatCurrency(selectedOrder.finalAmount)}</span>
                </div>
              </div>
            </div>

            {/* State Transition Actions */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #ebebeb', paddingTop: '20px' }}>
              <h3 style={{ ...infoTitleStyle, marginBottom: '12px' }}>⚙️ CHUYỂN ĐỔI TIẾN ĐỘ ĐƠN HÀNG</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {selectedOrder.orderStatus === 0 && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(selectedOrder.orderId, 1)}
                    disabled={updatingStatus}
                    style={primaryBtnStyle}
                  >
                    ✓ Xác Nhận Đơn Hàng
                  </button>
                )}

                {selectedOrder.orderStatus === 1 && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(selectedOrder.orderId, 2)}
                    disabled={updatingStatus}
                    style={{ ...primaryBtnStyle, backgroundColor: '#6d28d9' }}
                  >
                    📦 Bắt Đầu Đóng Gói
                  </button>
                )}

                {selectedOrder.orderStatus === 2 && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(selectedOrder.orderId, 3)}
                    disabled={updatingStatus}
                    style={{ ...primaryBtnStyle, backgroundColor: '#0369a1' }}
                  >
                    🚚 Bàn Giao Vận Chuyển
                  </button>
                )}

                {selectedOrder.orderStatus === 3 && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(selectedOrder.orderId, 4)}
                    disabled={updatingStatus}
                    style={{ ...primaryBtnStyle, backgroundColor: '#15803d' }}
                  >
                    ✅ Đã Giao Thành Công
                  </button>
                )}

                {/* Cancel action if not delivered/shipped */}
                {(selectedOrder.orderStatus === 0 || selectedOrder.orderStatus === 1 || selectedOrder.orderStatus === 2) && (
                  <button
                    type="button"
                    onClick={() => {
                      const reason = prompt('Nhập lý do hủy đơn hàng (Tồn kho sẽ được hoàn lại tự động):');
                      if (reason !== null) {
                        handleQuickStatusChange(selectedOrder.orderId, 5, reason);
                      }
                    }}
                    disabled={updatingStatus}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Hủy Đơn & Hoàn Tồn Kho
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #dddddd',
                    color: '#374151',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    print
                  </span>
                  <span>In phiếu gửi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSellerLayout>
  );
};

// ─── Inline Style Constants ──────────────────────────────────────────────────
const cardKpiStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '18px 20px',
  border: '1px solid #ebebeb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
};

const selectControlStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #dddddd',
  fontSize: '13px',
  backgroundColor: '#ffffff',
  color: '#374151',
  outline: 'none',
};

const actionBtnStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  color: '#4b5563',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 120ms ease',
};

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '10px',
  padding: '16px',
  border: '1px solid #f3f4f6',
};

const infoTitleStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: '#6b7280',
  margin: '0 0 10px 0',
  textTransform: 'uppercase',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '9px 18px',
  borderRadius: '8px',
  backgroundColor: '#ff385c',
  color: '#ffffff',
  border: 'none',
  fontSize: '13.5px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
};
