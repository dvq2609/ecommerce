export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface RegisterResponse {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  isEmailConfirmed: boolean;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
  imageUrl?: string;
}


export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}
