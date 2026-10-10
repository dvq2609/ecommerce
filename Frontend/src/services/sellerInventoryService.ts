export interface SellerInventoryItem {
  variantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  primaryImage: string;
  sku: string;
  colorName: string;
  hexCode: string;
  sizeName: string;
  price: number;
  stockQuantity: number;
  status: 'InStock' | 'LowStock' | 'OutOfStock';
  isActive: boolean;
  updatedAt?: string;
}

export interface SellerInventoryStats {
  totalVariants: number;
  totalUnitsInStock: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface SellerInventoryPagedResult {
  items: SellerInventoryItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateInventoryStockPayload {
  stockQuantity?: number;
  price?: number;
  isActive?: boolean;
}

export interface SellerInventoryApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const API_BASE = '/api/seller/inventory';

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
    const msg = data?.message ?? 'Đã xảy ra lỗi khi kết nối máy chủ quản lý kho.';
    throw new Error(msg);
  }
  return data as T;
}

export const sellerInventoryService = {
  /** Lấy danh sách tồn kho có phân trang, lọc và tìm kiếm */
  async getInventory(params?: {
    search?: string;
    stockFilter?: string;
    page?: number;
    pageSize?: number;
  }): Promise<SellerInventoryApiResponse<SellerInventoryPagedResult>> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.stockFilter) qs.set('stockFilter', params.stockFilter);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize));

    const url = qs.toString() ? `${API_BASE}?${qs}` : API_BASE;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<SellerInventoryApiResponse<SellerInventoryPagedResult>>(res);
  },

  /** Lấy 4 thẻ KPI thống kê tồn kho & cảnh báo */
  async getStats(): Promise<SellerInventoryApiResponse<SellerInventoryStats>> {
    const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() });
    return handleResponse<SellerInventoryApiResponse<SellerInventoryStats>>(res);
  },

  /** Cập nhật nhanh số lượng tồn kho & giá của 1 biến thể */
  async updateStock(
    variantId: number,
    payload: UpdateInventoryStockPayload
  ): Promise<SellerInventoryApiResponse<SellerInventoryItem>> {
    const res = await fetch(`${API_BASE}/variants/${variantId}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<SellerInventoryApiResponse<SellerInventoryItem>>(res);
  },
};
