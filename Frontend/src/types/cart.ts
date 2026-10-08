export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  sellerId: number;
  sellerName: string;
  productVariantId: number | null;
  colorId: number | null;
  colorName: string | null;
  hexCode: string | null;
  sizeId: number | null;
  sizeName: string | null;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  stockQuantity: number;
}

export interface CartData {
  cartId: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface CartApiResponse<T = CartData> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AddToCartPayload {
  productId: number;
  productVariantId?: number | null;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
