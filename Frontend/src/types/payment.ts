export interface PaymentStatusResponse {
  orderCode: string;
  paymentStatus: string;
  orderStatus: string;
  isPaid: boolean;
  amount: number;
  paidAt?: string | null;
  transactionRef?: string | null;
}
