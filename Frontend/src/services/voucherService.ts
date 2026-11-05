import type {
  VoucherItem,
  AvailableVouchersGrouped,
  CalculateVoucherStackRequest,
  CalculateVoucherStackResult,
  CreateUpdateVoucherPayload,
  AdminVoucherListResponse,
} from '../types/voucher';

const API_BASE = '/api/voucher';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonSafe(res: Response) {
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    if (res.status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    if (res.status === 403) {
      throw new Error('Chỉ tài khoản Admin mới có quyền quản lý mã giảm giá.');
    }
    throw new Error(json?.message || `Lỗi kết nối máy chủ (HTTP ${res.status}).`);
  }
  return json;
}

export const SAVED_SHIPPING_VOUCHER_KEY = 'shopvibe_saved_shipping_voucher';
export const SAVED_DISCOUNT_VOUCHER_KEY = 'shopvibe_saved_discount_voucher';

export const voucherService = {
  /**
   * Lấy danh sách mã Freeship & Mã giảm giá đang hoạt động cho Trang chủ (Public)
   */
  async getPublicVouchers(): Promise<VoucherItem[]> {
    try {
      const res = await fetch(`${API_BASE}/public`);
      if (!res.ok) return [];
      const json = await res.json().catch(() => null);
      return json?.data ?? [];
    } catch {
      return [];
    }
  },

  /**
   * Lấy danh sách mã chia 2 nhóm (Freeship + Giảm giá) kèm kiểm tra điều kiện đơn tối thiểu cho Buyer
   */
  async getAvailableVouchers(orderTotal: number, shippingFee: number): Promise<AvailableVouchersGrouped> {
    const res = await fetch(
      `${API_BASE}/available?orderTotal=${encodeURIComponent(orderTotal)}&shippingFee=${encodeURIComponent(shippingFee)}`,
      { headers: getAuthHeaders() }
    );
    const json = await parseJsonSafe(res);
    return json.data;
  },

  /**
   * Tính toán áp dụng đồng thời 1 Mã Freeship + 1 Mã Giảm giá trên Checkout
   */
  async calculateStack(payload: CalculateVoucherStackRequest): Promise<CalculateVoucherStackResult> {
    const res = await fetch(`${API_BASE}/calculate-stack`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await parseJsonSafe(res);
    return json.data;
  },

  // ─── Admin-Only Endpoints ─────────────────────────────────────────
  async getAdminVouchers(): Promise<AdminVoucherListResponse> {
    const res = await fetch(`${API_BASE}/admin`, {
      headers: getAuthHeaders(),
    });
    const json = await parseJsonSafe(res);
    return json.data;
  },

  async createVoucher(payload: CreateUpdateVoucherPayload): Promise<{ message: string; data: VoucherItem }> {
    const res = await fetch(`${API_BASE}/admin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonSafe(res);
  },

  async updateVoucher(voucherId: number, payload: CreateUpdateVoucherPayload): Promise<{ message: string; data: VoucherItem }> {
    const res = await fetch(`${API_BASE}/admin/${voucherId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonSafe(res);
  },

  async toggleVoucher(voucherId: number): Promise<{ message: string; data: VoucherItem }> {
    const res = await fetch(`${API_BASE}/admin/${voucherId}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return parseJsonSafe(res);
  },

  async deleteVoucher(voucherId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/${voucherId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return parseJsonSafe(res);
  },
};
