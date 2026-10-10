export interface ProductVariantColor {
  id: string;
  name: string;
  hex: string;
  imageIndex?: number;
}

export interface ProductVariantSize {
  id: string;
  name: string;
  description?: string;
  inStock: boolean;
}

export interface ProductSpecItem {
  label: string;
  value: string;
}

export interface ProductReviewItem {
  id: string;
  userName: string;
  avatarLetter?: string;
  rating: number;
  timeAgo: string;
  variantInfo: string;
  comment: string;
  isVerifiedPurchase: boolean;
  userPhotos?: string[];
  sellerReply?: string;
  sellerRepliedAt?: string;
}

export interface RecommendedProduct {
  id: string;
  title: string;
  tag: string;
  subtitle: string;
  price: number;
  rating: number;
  imageUrl: string;
}

export interface ProductVariantItem {
  variantId: number;
  productId: number;
  colorId: number;
  colorName: string;
  hexCode: string;
  sizeId: number;
  sizeName: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductDetailData {
  id: string;
  sku: string;
  title: string;
  slug?: string;
  collectionTag: string;
  brandTag: string;
  isMall: boolean;
  isNewArrival: boolean;
  shippingTag: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  savingsAmount: number;
  rating: number;
  ratingCount: number;
  soldCountText: string;
  satisfactionRate: string;
  vouchers?: Array<{
    id: string;
    text: string;
    type: 'discount' | 'shipping' | 'cashback';
  }>;
  images: string[];
  colors: ProductVariantColor[];
  sizes: ProductVariantSize[];
  variants?: ProductVariantItem[];
  stockQuantity: number;
  shippingEstimate: {
    deliveryDateText: string;
    description: string;
    freeShippingThresholdText: string;
  };
  guarantees: Array<{
    title: string;
    subtitle: string;
    icon: string;
  }>;
  specs: ProductSpecItem[];
  descriptionText: string;
  reviewsDistribution: Array<{
    stars: number;
    percentage: number;
  }>;
  reviews: ProductReviewItem[];
  recommendations: RecommendedProduct[];
}

