export interface SellerKpiData {
  totalRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
  averageOrderValue: number;
  successRate: number;
}

export interface RevenueChartPoint {
  timeLabel: string;
  revenue: number;
  orderCount: number;
}

export interface OrderStatusBreakdownItem {
  statusKey: string;
  statusName: string;
  count: number;
  percentage: number;
  colorHex: string;
}

export interface SellerAnalyticsApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const API_BASE = '/api/seller/analytics';

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
    const msg = data?.message ?? 'Đã xảy ra lỗi khi kết nối máy chủ thống kê.';
    throw new Error(msg);
  }
  return data as T;
}

export const sellerAnalyticsService = {
  /** Lấy các chỉ số KPI tài chính của Seller theo kỳ (today, 7days, 30days, 1year) */
  async getKpis(period = '7days'): Promise<SellerAnalyticsApiResponse<SellerKpiData>> {
    const res = await fetch(`${API_BASE}/kpi?period=${encodeURIComponent(period)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SellerAnalyticsApiResponse<SellerKpiData>>(res);
  },

  /** Lấy chuỗi dữ liệu biến động doanh thu & đơn hàng theo thời gian */
  async getRevenueChart(period = '7days'): Promise<SellerAnalyticsApiResponse<RevenueChartPoint[]>> {
    const res = await fetch(`${API_BASE}/revenue-chart?period=${encodeURIComponent(period)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SellerAnalyticsApiResponse<RevenueChartPoint[]>>(res);
  },

  /** Lấy tỷ lệ phân bổ đơn hàng theo trạng thái */
  async getStatusBreakdown(period = '7days'): Promise<SellerAnalyticsApiResponse<OrderStatusBreakdownItem[]>> {
    const res = await fetch(`${API_BASE}/status-breakdown?period=${encodeURIComponent(period)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SellerAnalyticsApiResponse<OrderStatusBreakdownItem[]>>(res);
  },
};
