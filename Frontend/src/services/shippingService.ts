import type {
  ShippingSetting,
  UpdateShippingSettingRequest,
  ShippingRule,
  CreateShippingRuleRequest,
  UpdateShippingRuleRequest,
  CalculateShippingRequest,
  CalculateShippingResponse,
} from '../types/shipping';

const API_BASE = '/api/Shipping';

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
  return data;
}

export const shippingService = {
  /** Lấy cấu hình public (ngưỡng freeship, phí mặc định) */
  async getConfig(): Promise<{ success: boolean; data: ShippingSetting }> {
    const res = await fetch(`${API_BASE}/config`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  /** Tính phí ship động theo địa chỉ & giá trị đơn hàng */
  async calculateFee(payload: CalculateShippingRequest): Promise<{ success: boolean; data: CalculateShippingResponse }> {
    const res = await fetch(`${API_BASE}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

  /** [Admin] Lấy cấu hình ngưỡng freeship */
  async getAdminSettings(): Promise<{ success: boolean; data: ShippingSetting }> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  /** [Admin] Cập nhật cấu hình ngưỡng freeship */
  async updateAdminSettings(payload: UpdateShippingSettingRequest): Promise<{ success: boolean; data: ShippingSetting }> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  /** [Admin] Lấy danh sách quy tắc tuyến vận chuyển */
  async getAllRules(): Promise<{ success: boolean; data: ShippingRule[] }> {
    const res = await fetch(`${API_BASE}/admin/rules`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  /** [Admin] Thêm tuyến vận chuyển mới */
  async createRule(payload: CreateShippingRuleRequest): Promise<{ success: boolean; data: ShippingRule }> {
    const res = await fetch(`${API_BASE}/admin/rules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  /** [Admin] Cập nhật tuyến vận chuyển */
  async updateRule(id: number, payload: UpdateShippingRuleRequest): Promise<{ success: boolean; data: ShippingRule }> {
    const res = await fetch(`${API_BASE}/admin/rules/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  /** [Admin] Xóa tuyến vận chuyển */
  async deleteRule(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/rules/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
