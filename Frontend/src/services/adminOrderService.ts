import type {
  AdminOrderQuery,
  AdminOrderDetail,
  AdminPagedOrderResult,
  AdminOrderStats,
  AdminUpdateOrderStatusPayload,
  AdminUpdatePaymentStatusPayload,
  AdminOrderApiResponse,
} from '../types/adminOrder';

const API_BASE = '/api/AdminOrder';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message ?? 'Đã xảy ra lỗi khi kết nối máy chủ.';
    throw new Error(msg);
  }
  return data as T;
}

export const adminOrderService = {
  /** Lấy danh sách đơn hàng có phân trang & lọc đa tiêu chí */
  async getOrders(params?: AdminOrderQuery): Promise<AdminOrderApiResponse<AdminPagedOrderResult>> {
    const qs = new URLSearchParams();
    if (params?.pageNumber) qs.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
    if (params?.status !== undefined) qs.set('status', String(params.status));
    if (params?.paymentStatus !== undefined) qs.set('paymentStatus', String(params.paymentStatus));
    if (params?.paymentMethod !== undefined) qs.set('paymentMethod', String(params.paymentMethod));
    if (params?.search) qs.set('search', params.search);
    if (params?.fromDate) qs.set('fromDate', params.fromDate);
    if (params?.toDate) qs.set('toDate', params.toDate);
    if (params?.sortBy) qs.set('sortBy', params.sortBy);
    if (params?.isDescending !== undefined) qs.set('isDescending', String(params.isDescending));

    const url = qs.toString() ? `${API_BASE}?${qs}` : API_BASE;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<AdminOrderApiResponse<AdminPagedOrderResult>>(res);
  },

  /** Lấy số liệu thống kê đơn hàng (dashboard KPI) */
  async getStats(): Promise<AdminOrderApiResponse<AdminOrderStats>> {
    const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() });
    return handleResponse<AdminOrderApiResponse<AdminOrderStats>>(res);
  },

  /** Lấy chi tiết đơn hàng theo ID */
  async getOrderById(orderId: number): Promise<AdminOrderApiResponse<AdminOrderDetail>> {
    const res = await fetch(`${API_BASE}/${orderId}`, { headers: getAuthHeaders() });
    return handleResponse<AdminOrderApiResponse<AdminOrderDetail>>(res);
  },

  /** Cập nhật trạng thái đơn hàng (Xác nhận, Đang đóng gói, Giao hàng, Hủy...) */
  async updateOrderStatus(
    orderId: number,
    payload: AdminUpdateOrderStatusPayload
  ): Promise<AdminOrderApiResponse<AdminOrderDetail>> {
    const res = await fetch(`${API_BASE}/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<AdminOrderApiResponse<AdminOrderDetail>>(res);
  },

  /** Cập nhật trạng thái thanh toán đơn hàng (Chờ thanh toán, Đã thanh toán, Thất bại) */
  async updatePaymentStatus(
    orderId: number,
    payload: AdminUpdatePaymentStatusPayload
  ): Promise<AdminOrderApiResponse<AdminOrderDetail>> {
    const res = await fetch(`${API_BASE}/${orderId}/payment-status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<AdminOrderApiResponse<AdminOrderDetail>>(res);
  },
};

/** Metadata hiển thị trạng thái đơn hàng */
export const adminOrderStatusMeta: Record<
  number,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  0: { label: 'Chờ xác nhận',       color: '#b45309', bg: '#fef3c7', border: '#fde68a', icon: '⏳' },
  1: { label: 'Đã xác nhận',         color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', icon: '📋' },
  2: { label: 'Đang đóng gói',       color: '#6d28d9', bg: '#ede9fe', border: '#ddd6fe', icon: '📦' },
  3: { label: 'Đang giao hàng',       color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd', icon: '🚚' },
  4: { label: 'Giao thành công',     color: '#15803d', bg: '#dcfce7', border: '#bbf7d0', icon: '✅' },
  5: { label: 'Đã hủy',              color: '#991b1b', bg: '#fee2e2', border: '#fecaca', icon: '❌' },
  6: { label: 'Đã hoàn tiền',        color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb', icon: '🔄' },
};

/** Metadata hiển thị trạng thái thanh toán */
export const adminPaymentStatusMeta: Record<
  number,
  { label: string; color: string; bg: string; border: string }
> = {
  0: { label: 'Chờ thanh toán', color: '#b45309', bg: '#fffbeb', border: '#fef3c7' },
  1: { label: 'Đã thanh toán',  color: '#15803d', bg: '#f0fdf4', border: '#dcfce7' },
  2: { label: 'Thất bại',       color: '#b91c1c', bg: '#fef2f2', border: '#fee2e2' },
  3: { label: 'Đã hoàn tiền',   color: '#4b5563', bg: '#f9fafb', border: '#f3f4f6' },
};
