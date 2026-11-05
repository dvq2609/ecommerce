export type VoucherDiscountType = 0 | 1 | 2; // 0 = Percentage, 1 = FixedAmount, 2 = FreeShipping

export interface VoucherItem {
  voucherId: number;
  code: string;
  title: string;
  description?: string | null;
  discountType: VoucherDiscountType;
  discountTypeName: string;
  isShippingVoucher: boolean;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  maxUsagePerUser: number;
  isActive: boolean;
  createdAt: string;
  isExpired: boolean;
  isExhausted: boolean;
  usagePercentage: number;
}

export interface AvailableVoucherItem extends VoucherItem {
  isEligible: boolean;
  ineligibleReason?: string | null;
  missingAmountToQualify: number;
  calculatedDiscount: number;
  userUsedCount: number;
  remainingUsesForUser: number;
}

export interface AvailableVouchersGrouped {
  shippingVouchers: AvailableVoucherItem[];
  discountVouchers: AvailableVoucherItem[];
}

export interface CalculateVoucherStackRequest {
  shippingVoucherCode?: string | null;
  discountVoucherCode?: string | null;
  quickInputCode?: string | null;
  orderTotal: number;
  shippingFee: number;
}

export interface CalculateVoucherStackResult {
  success: boolean;
  message: string;
  appliedShippingVoucherCode?: string | null;
  appliedShippingVoucher?: AvailableVoucherItem | null;
  shippingDiscountAmount: number;
  appliedDiscountVoucherCode?: string | null;
  appliedDiscountVoucher?: AvailableVoucherItem | null;
  productDiscountAmount: number;
  totalDiscountAmount: number;
  finalShippingFee: number;
  finalAmount: number;
}

export interface CreateUpdateVoucherPayload {
  code: string;
  title: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  maxUsagePerUser: number;
  isActive: boolean;
}

export interface VoucherStats {
  totalVouchers: number;
  activeVouchers: number;
  shippingVouchersCount: number;
  discountVouchersCount: number;
  totalRedemptions: number;
  totalDiscountGranted: number;
  expiringSoonCount: number;
}

export interface AdminVoucherListResponse {
  stats: VoucherStats;
  items: VoucherItem[];
}
