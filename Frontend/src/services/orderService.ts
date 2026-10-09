import type {
  CreateOrderRequest,
  CancelOrderRequest,
  PagedOrderResult,
  OrderQueryParams,
  OrderApiResponse,
} from '../types/order';

const API_BASE = '/api/Order';

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
    const msg = data?.message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
    throw new Error(msg);
  }
  return data as T;
}

export const orderService = {
  /** Tạo đơn hàng mới từ Cart hoặc Buy Now */
  async createOrder(payload: CreateOrderRequest): Promise<OrderApiResponse> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<OrderApiResponse>(res);
  },

  /** Lấy danh sách đơn hàng có phân trang + lọc trạng thái */
  async getMyOrders(params?: OrderQueryParams): Promise<OrderApiResponse<PagedOrderResult>> {
    const qs = new URLSearchParams();
    if (params?.pageNumber) qs.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
    if (params?.status !== undefined) qs.set('status', String(params.status));
    if (params?.search) qs.set('search', params.search);

    const url = qs.toString() ? `${API_BASE}?${qs}` : API_BASE;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<OrderApiResponse<PagedOrderResult>>(res);
  },

  /** Lấy chi tiết đơn theo ID */
  async getOrderById(id: number): Promise<OrderApiResponse> {
    const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
    return handleResponse<OrderApiResponse>(res);
  },

  /** Lấy chi tiết đơn theo mã */
  async getOrderByCode(code: string): Promise<OrderApiResponse> {
    const res = await fetch(`${API_BASE}/code/${code}`, { headers: getAuthHeaders() });
    return handleResponse<OrderApiResponse>(res);
  },

  /** Hủy đơn hàng */
  async cancelOrder(id: number, payload?: CancelOrderRequest): Promise<OrderApiResponse> {
    const res = await fetch(`${API_BASE}/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload ?? {}),
    });
    return handleResponse<OrderApiResponse>(res);
  },
};

/** Map PaymentMethod enum (số → label) */
export const paymentMethodLabel: Record<number, string> = {
  0: 'Thanh toán khi nhận hàng (COD)',
  1: 'Chuyển khoản ngân hàng (VietQR)',
  2: 'Cổng thanh toán VNPay',
  3: 'Ví điện tử MoMo',
};

/** Map OrderStatus enum (số → label, màu badge) */
export const orderStatusMeta: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Chờ xác nhận',         color: '#b45309', bg: '#fef3c7' },
  1: { label: 'Đã xác nhận',           color: '#1d4ed8', bg: '#dbeafe' },
  2: { label: 'Đang xử lý đóng gói',   color: '#6d28d9', bg: '#ede9fe' },
  3: { label: 'Đang giao hàng',         color: '#0369a1', bg: '#e0f2fe' },
  4: { label: 'Đã giao thành công',     color: '#15803d', bg: '#dcfce7' },
  5: { label: 'Đã hủy',                color: '#991b1b', bg: '#fee2e2' },
  6: { label: 'Đã hoàn tiền',          color: '#6a6a6a', bg: '#f3f4f6' },
};
