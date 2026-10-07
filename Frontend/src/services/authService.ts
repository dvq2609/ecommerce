import type {
  ApiMessageResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from '../types/auth';

const API_BASE = '/api/auth';

class ApiError extends Error {
  errors?: Record<string, string[]>;
  status?: number;

  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMessage = 'Đã xảy ra lỗi, vui lòng thử lại.';

    if (data) {
      if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (data.errors && typeof data.errors === 'object') {
        // Trích xuất error message đầu tiên từ ModelState
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
          errorMessage = data.errors[firstKey][0];
        }
      }
    }

    throw new ApiError(errorMessage, response.status, data?.errors);
  }

  return data as T;
}

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<LoginResponse>(res);
    // Lưu token vào localStorage để tiện dùng
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        imageUrl: data.imageUrl,
      }));
    }
    return data;
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<RegisterResponse>(res);
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<ApiMessageResponse> {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ApiMessageResponse>(res);
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<ApiMessageResponse> {
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ApiMessageResponse>(res);
  },

  async verifyEmail(payload: VerifyEmailRequest): Promise<ApiMessageResponse> {
    const res = await fetch(`${API_BASE}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ApiMessageResponse>(res);
  },

  async resendVerification(payload: ResendVerificationRequest): Promise<ApiMessageResponse> {
    const res = await fetch(`${API_BASE}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ApiMessageResponse>(res);
  },


  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};
export { ApiError };
