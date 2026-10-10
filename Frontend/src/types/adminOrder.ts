import type { OrderResponse, OrderStatus, PaymentMethod, PaymentStatus } from './order';

// ─── Query Params cho Admin ──────────────────────────────────────────
export interface AdminOrderQuery {
  pageNumber?: number;
  pageSize?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'createdAt' | 'finalAmount';
  isDescending?: boolean;
}

// ─── Payloads cập nhật trạng thái ─────────────────────────────────────
export interface AdminUpdateOrderStatusPayload {
  newStatus: OrderStatus;
  note?: string;
}

export interface AdminUpdatePaymentStatusPayload {
  newPaymentStatus: PaymentStatus;
  note?: string;
}

// ─── Chi tiết đơn hàng mở rộng cho Admin ─────────────────────────────
export interface AdminOrderDetail extends OrderResponse {
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
}

// ─── Kết quả phân trang Admin ─────────────────────────────────────────
export interface AdminPagedOrderResult {
  items: AdminOrderDetail[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// ─── Thống kê nhanh đơn hàng ──────────────────────────────────────────
export interface AdminOrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  totalRevenue: number;
}

// ─── Base API Response ────────────────────────────────────────────────
export interface AdminOrderApiResponse<T = AdminOrderDetail> {
  success: boolean;
  message?: string;
  data: T;
}
