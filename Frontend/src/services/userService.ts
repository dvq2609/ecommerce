import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserAddress,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '../types/user';

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

export const userService = {
  // ─── PROFILE ENDPOINTS ───────────────────────────────────────────────────────
  async getProfile(): Promise<UserProfile> {
    const res = await fetch('/api/Auth/me', {
      headers: getAuthHeaders(),
    });
    return handleResponse<UserProfile>(res);
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<{ success: boolean; message: string; data: UserProfile }> {
    const res = await fetch('/api/Auth/me', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async changePassword(payload: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/Auth/change-password', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ─── ADDRESS BOOK ENDPOINTS ──────────────────────────────────────────────────
  async getAddresses(): Promise<{ success: boolean; data: UserAddress[] }> {
    const res = await fetch('/api/Address', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAddressById(id: number): Promise<{ success: boolean; data: UserAddress }> {
    const res = await fetch(`/api/Address/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getDefaultAddress(): Promise<{ success: boolean; data: UserAddress | null }> {
    const res = await fetch('/api/Address/default', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createAddress(payload: CreateAddressRequest): Promise<{ success: boolean; message: string; data: UserAddress }> {
    const res = await fetch('/api/Address', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateAddress(id: number, payload: UpdateAddressRequest): Promise<{ success: boolean; message: string; data: UserAddress }> {
    const res = await fetch(`/api/Address/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async setDefaultAddress(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/Address/${id}/default`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async deleteAddress(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/Address/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
