import type { PaymentStatusResponse } from '../types/payment';

const API_BASE = '/api/Payment';

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

export const paymentService = {
  // Polling kiểm tra trạng thái thanh toán realtime
  checkPaymentStatus: async (orderCode: string): Promise<PaymentStatusResponse> => {
    const res = await fetch(`${API_BASE}/order/${encodeURIComponent(orderCode)}/status`, {
      headers: getAuthHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: PaymentStatusResponse }>(res);
    return result.data;
  },

  // Tạo phiên thanh toán qua cổng MoMo (lấy payUrl)
  createMoMoPayment: async (orderCode: string): Promise<{ success: boolean; payUrl?: string; message?: string }> => {
    const res = await fetch(`${API_BASE}/momo/create/${encodeURIComponent(orderCode)}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; payUrl?: string; message?: string }>(res);
  },

  // Kiểm tra callback sau khi thanh toán qua MoMo quay về
  queryMoMoCallback: async (orderId: string, resultCode?: number): Promise<{ success: boolean; message?: string; data?: PaymentStatusResponse }> => {
    const qs = new URLSearchParams({ orderId });
    if (resultCode !== undefined) qs.set('resultCode', String(resultCode));
    const res = await fetch(`${API_BASE}/momo/callback?${qs}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message?: string; data?: PaymentStatusResponse }>(res);
  },
};
