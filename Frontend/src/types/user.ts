export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  status: boolean;
  isLocked: boolean;
  imageUrl?: string;
  address?: string;
  hasPassword: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  address?: string;
  imageUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UserAddress {
  addressId: number;
  userId: number;
  receiverName: string;
  receiverPhone: string;
  streetAddress: string;
  provinceCity: string;
  district?: string;
  ward?: string;
  fullAddress: string;
  addressType: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAddressRequest {
  receiverName: string;
  receiverPhone: string;
  streetAddress: string;
  provinceCity: string;
  district?: string;
  ward?: string;
  addressType?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends CreateAddressRequest {}
