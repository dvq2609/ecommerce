import { authService } from './authService';

export interface AdminKpiSummary {
  totalGmv: number;
  netRevenue: number;
  totalDiscountGiven: number;
  totalShippingCollected: number;
  averageOrderValue: number;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  successRate: number;
  totalBuyers: number;
  totalSellers: number;
  totalActiveProducts: number;
  totalVoucherRedemptions: number;
}

export interface AdminRevenuePoint {
  timeLabel: string;
  gmv: number;
  netRevenue: number;
  orderCount: number;
}

export interface OrderStatusBreakdownItem {
  statusKey: string;
  statusName: string;
  count: number;
  percentage: number;
  colorHex: string;
}

export interface PaymentMethodBreakdownItem {
  methodKey: string;
  methodName: string;
  orderCount: number;
  totalAmount: number;
  percentage: number;
}

export interface TopSellerItem {
  sellerId: number;
  sellerName: string;
  sellerEmail: string;
  activeProductCount: number;
  orderCount: number;
  totalItemsSold: number;
  totalRevenue: number;
}

export interface TopProductItem {
  productId: number;
  productName: string;
  categoryName: string;
  brandName: string;
  imageUrl?: string | null;
  unitPrice: number;
  totalSoldQuantity: number;
  totalRevenue: number;
}

export interface VoucherPerformanceItem {
  voucherId: number;
  code: string;
  title: string;
  discountType: number;
  discountValue: number;
  usedCount: number;
  usageLimit: number;
  isActive: boolean;
  totalDiscountBooked: number;
  generatedGmv: number;
}

export interface AdminDashboardOverview {
  kpi: AdminKpiSummary;
  revenueTrend: AdminRevenuePoint[];
  orderStatusBreakdown: OrderStatusBreakdownItem[];
  paymentBreakdown: PaymentMethodBreakdownItem[];
  topSellers: TopSellerItem[];
  topProducts: TopProductItem[];
  voucherPerformance: VoucherPerformanceItem[];
}

export const adminAnalyticsService = {
  async getOverview(period: string = 'all'): Promise<AdminDashboardOverview> {
    const token = authService.getToken() || localStorage.getItem('accessToken');
    const res = await fetch(
      `/api/admin/analytics/overview?period=${encodeURIComponent(period)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || `Không thể tải thống kê toàn sàn (HTTP ${res.status}).`);
    }
    return json.data as AdminDashboardOverview;
  },
};
