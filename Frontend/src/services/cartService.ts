import type { AddToCartPayload, CartApiResponse, CartData } from '../types/cart';

const API_BASE = '/api/cart';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let errorMessage = 'Không thể kết nối đến máy chủ giỏ hàng.';
    if (data?.message) {
      errorMessage = data.message;
    } else if (res.status === 401) {
      errorMessage = 'Vui lòng đăng nhập để sử dụng giỏ hàng.';
    } else if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey && Array.isArray(data.errors[firstKey])) {
        errorMessage = data.errors[firstKey][0];
      }
    }
    throw new Error(errorMessage);
  }

  const result = data as CartApiResponse<T>;
  return result.data;
}

export const cartService = {
  /**
   * Lấy giỏ hàng chi tiết của người dùng
   */
  async getCart(): Promise<CartData> {
    const res = await fetch(API_BASE, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<CartData>(res);
  },

  /**
   * Thêm sản phẩm (kèm biến thể nếu có) vào giỏ hàng
   */
  async addToCart(payload: AddToCartPayload): Promise<CartData> {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<CartData>(res);
  },

  /**
   * Cập nhật số lượng của một món hàng trong giỏ
   */
  async updateQuantity(cartItemId: number, quantity: number): Promise<CartData> {
    const res = await fetch(`${API_BASE}/items/${cartItemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return handleResponse<CartData>(res);
  },

  /**
   * Xóa một món hàng khỏi giỏ
   */
  async removeItem(cartItemId: number): Promise<CartData> {
    const res = await fetch(`${API_BASE}/items/${cartItemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<CartData>(res);
  },

  /**
   * Xóa sạch toàn bộ giỏ hàng
   */
  async clearCart(): Promise<CartData> {
    const res = await fetch(`${API_BASE}/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<CartData>(res);
  },
};
