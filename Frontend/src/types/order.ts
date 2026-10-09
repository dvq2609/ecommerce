// ─── Request Types ────────────────────────────────────────────────
export interface OrderItemRequest {
  productId: number;
  productVariantId?: number | null;
  quantity: number;
}

export interface CreateOrderRequest {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  note?: string;
  paymentMethod: PaymentMethod;
  items?: OrderItemRequest[] | null; // null = Cart Checkout; filled = Buy Now
  saveToProfile?: boolean;
}

export interface CancelOrderRequest {
  reason?: string;
}

// ─── Response Types ───────────────────────────────────────────────
export type PaymentMethod = 0 | 1 | 2 | 3; // COD=0, BankTransfer=1, VNPay=2, MoMo=3
export type PaymentStatus = 0 | 1 | 2 | 3; // Pending=0, Paid=1, Failed=2, Refunded=3
export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Pending→Refunded

export interface OrderItemResponse {
  orderItemId: number;
  orderId: number;
  productId: number;
  productVariantId: number | null;
  productName: string;
  variantInfo: string | null;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderResponse {
  orderId: number;
  userId: number;
  orderCode: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  note: string | null;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentMethodName: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  orderStatusName: string;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  orderItems: OrderItemResponse[];
}

export interface PagedOrderResult {
  items: OrderResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface OrderQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
}

export interface OrderApiResponse<T = OrderResponse> {
  success: boolean;
  message?: string;
  data: T;
}
