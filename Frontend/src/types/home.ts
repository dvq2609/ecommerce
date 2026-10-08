export interface HeroSlide {
  id: string;
  badge: string;
  slideNumber: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

export interface TrustBadge {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

export interface QuickCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  badge?: string;
}

export interface FlashSaleItem {
  id: string;
  title: string;
  brandTag: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  soldCount: number;
  totalStock: number;
  imageUrl: string;
  isLiked?: boolean;
}

export interface ProductCatalogItem {
  id: string;
  title: string;
  category: string;
  brandTag: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  deliveryTag: string;
  imageUrl: string;
  isLiked?: boolean;
}
