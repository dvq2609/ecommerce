export interface VietQRInfo {
  orderCode: string;
  amount: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrImageUrl: string;
  paymentStatus: string;
  isPaid: boolean;
  paidAt?: string | null;
}

export interface PaymentStatusResponse {
  orderCode: string;
  paymentStatus: string;
  orderStatus: string;
  isPaid: boolean;
  amount: number;
  paidAt?: string | null;
  transactionRef?: string | null;
}

export interface SimulatePaymentResponse {
  success: boolean;
  message: string;
  data?: PaymentStatusResponse;
}
