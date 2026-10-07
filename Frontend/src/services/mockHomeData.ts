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

export const CITIES_LIST = [
  'Hà Nội, Q. Cầu Giấy',
  'TP. Hồ Chí Minh, Q. 1',
  'Đà Nẵng, Q. Hải Châu',
  'Hải Phòng, Q. Ngô Quyền',
  'Cần Thơ, Q. Ninh Kiều'
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    badge: 'BỘ SƯU TẬP THU 2026',
    slideNumber: '1/3',
    title: 'Tối Giản & Thanh Lịch',
    subtitle: 'Ưu đãi ra mắt lên đến 40%',
    ctaText: 'Khám phá ngay',
    ctaLink: '/catalog',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnGhjGz7zYwYDnheikBeB37kM7MypI1Xq1idXwXG69WiA00E6UrzAlqfSNbJihiucWzJ36o5uBlUtqhEXjrxGBCYcdZgmfqf25N991RHpsPCrTl9afQolDFIk4KYR26MN8d6cS49X0LmExsDd6aCGWxiueCWs3cLXGPiO1g8bs_7MI3NYbDiMMH0cQJYn1RJbPLU-AXIN6HhCfiyW3heVdBp4DRXSqByOlafSwIi7y'
  },
  {
    id: 'slide-2',
    badge: 'EXCLUSIVE VIBE',
    slideNumber: '2/3',
    title: 'Urban Chic Autumn',
    subtitle: 'Voucher 100k cho đơn từ 499k',
    ctaText: 'Mua ngay',
    ctaLink: '/catalog?trend=urban',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0S48Yw4Dill2N_OQtvxP3oCAC7SYVou3xIuYOE2VXzujllQCMDa7FOzbJNwpXSQbdenxB7R3EEeVhalST42H3Eq4_n8Q-bT1rijclGKUTtPqS2OoS1rrQSjULFUxA6_2H305u6UMPusHj11YdGo0TySqn8QmxtrZoNL3HuOoz8viKkdamTKytvxlIyHz2JQmPibGUaAV1imiR96kwYPTPVIi9xhTljk-xSgDdFepl'
  },
  {
    id: 'slide-3',
    badge: 'MALL LUXE SELECTION',
    slideNumber: '3/3',
    title: 'Phụ Kiện Da Cao Cấp',
    subtitle: 'Bảo hành chính hãng 12 tháng',
    ctaText: 'Xem bộ sưu tập',
    ctaLink: '/catalog?cat=bags',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0YVHbEgcOimmNHitO03yMGeB2Ac49AiobKoVBcCFY-QW6voPDKL81fmeI5qX4u43tXtP-Mb43YfwWstvapNO7IB-nJiVrGrWQg6AXtS8J6sCcUCNuM-fav-VpqRZv4dfvae40rMJhj5IMyAcwSyeWD5LQg2UQB0cHqfEoU3yY8wVuFBnGs-xNoJ5UDZXNBDRaKOviPabAA6sW1KTexJhNpDMmutiUZTlpuM8yH2-c'
  }
];

export const TRUST_BADGES: TrustBadge[] = [
  {
    id: 'trust-1',
    icon: 'verified',
    title: '100% Chính Hãng',
    subtitle: 'Hoàn tiền gấp 2 nếu giả'
  },
  {
    id: 'trust-2',
    icon: 'published_with_changes',
    title: 'Đổi Trả 30 Ngày',
    subtitle: 'Thủ tục nhanh gọn'
  },
  {
    id: 'trust-3',
    icon: 'local_shipping',
    title: 'Giao Siêu Tốc 2H',
    subtitle: 'Miễn phí đơn từ 300k'
  }
];

export const QUICK_CATEGORIES: QuickCategory[] = [
  { id: 'cat-all', name: 'Tất cả', slug: 'all', icon: 'apps' },
  { id: 'cat-blazer', name: 'Áo Blazer & Vest', slug: 'ao-blazer', icon: 'apparel', badge: 'Hot' },
  { id: 'cat-dress', name: 'Đầm & Váy Dự Tiệc', slug: 'dam-vay', icon: 'styler' },
  { id: 'cat-bags', name: 'Túi Xách Vibe Luxe', slug: 'tui-xach', icon: 'shopping_bag' },
  { id: 'cat-shoes', name: 'Giày & Boots Da', slug: 'giay-boots', icon: 'steps' },
  { id: 'cat-accessories', name: 'Phụ Kiện Tinh Tế', slug: 'phu-kien', icon: 'watch' },
  { id: 'cat-cardigan', name: 'Len & Thu Đông', slug: 'len-thu-dong', icon: 'ac_unit' }
];

export const FLASH_SALE_PRODUCTS: FlashSaleItem[] = [
  {
    id: 'fs-1',
    title: 'Áo Blazer Oversize Form Rộng Phong Cách Hàn Quốc',
    brandTag: 'ShopVibe Mall',
    price: 890000,
    originalPrice: 1200000,
    discountPercent: 26,
    soldCount: 78,
    totalStock: 100,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu8WQkUEaRBY4I-PdmTJod9NG-CdeISEKn_fEFHQoNhx6sSo0DRhr9259puD9eM3uTEktXfZm6JfjIPi29TDGXLgsUZteLB4ETYQgmWhaO9skDI732cl-M0RpkvqWiDZDMk9HxqUTqJhS0I8vjGdE6PQ50lS_-Z1NmNEaXw1z2vgSK8lKRtfspJjNOuJjK77s85VvCdZL9tb80b-XxocTnuPDlyoQp3tNa7GQ2WMpF'
  },
  {
    id: 'fs-2',
    title: 'Túi Xách Đeo Chéo Da Bò Vibe Luxe Minimalist',
    brandTag: 'ShopVibe Mall',
    price: 1450000,
    originalPrice: 2200000,
    discountPercent: 34,
    soldCount: 92,
    totalStock: 100,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0YVHbEgcOimmNHitO03yMGeB2Ac49AiobKoVBcCFY-QW6voPDKL81fmeI5qX4u43tXtP-Mb43YfwWstvapNO7IB-nJiVrGrWQg6AXtS8J6sCcUCNuM-fav-VpqRZv4dfvae40rMJhj5IMyAcwSyeWD5LQg2UQB0cHqfEoU3yY8wVuFBnGs-xNoJ5UDZXNBDRaKOviPabAA6sW1KTexJhNpDMmutiUZTlpuM8yH2-c'
  },
  {
    id: 'fs-3',
    title: 'Cardigan Dệt Kim Len Mềm Khuy Đồi Mồi Vintage',
    brandTag: 'ShopVibe Mall',
    price: 680000,
    originalPrice: 850000,
    discountPercent: 20,
    soldCount: 45,
    totalStock: 100,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA68KzepMf4O12sIToQLYg85SBBS0kJ8KZPsL-oJpk5jRLt0E_VJW9BQDtDtMrTibaAHNB9Zxx7BFaQvYWhZuepehunzwaRk5t-8CjnTT2cRzxScHtxj_4FtyI2nESvb3H1vVme3lM5Hc30tmz0_DJ_2QaYny16hzEwUnF64i1EqTCt-XpNKnJMG_Kycqg-gjQ7CWTiEty3csGm9DHtbUbYausJhRquTkht03MQ4X8h'
  },
  {
    id: 'fs-4',
    title: 'Áo Măng Tô Dạ Dáng Dài Camel Warm Trench',
    brandTag: 'ShopVibe Mall',
    price: 1890000,
    originalPrice: 2600000,
    discountPercent: 27,
    soldCount: 65,
    totalStock: 80,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwqd7Defw7wvrxQyTQgmePcpgRXlkyW2FmKacVF9ZG0CTQDTRfqL-_G9nkU9pX6l00oBrloSilhivJxYrjpm-m7aIOuoYwsoWHmp9u0rY-l9L6XFB4Qqsafe0hlfqJ0i-Ug4tEno4p8U1TdH9eVbEQO3dXbQdjjGfScsczgW8xzSoEW-XjT8ZOqwoaIQ872Wr5eOA_nbFdwDLtkBdUfSM2YfYPP1VgFmteaK6j_k5U'
  }
];

export const MAIN_CATALOG_PRODUCTS: ProductCatalogItem[] = [
  {
    id: 'prod-1',
    title: 'Áo Khoác Wool Blend Premium Màu Be Sữa Dáng Lửng',
    category: 'ao-blazer',
    brandTag: 'ShopVibe Mall',
    price: 950000,
    originalPrice: 1350000,
    discountPercent: 30,
    rating: 4.9,
    reviewCount: 142,
    deliveryTag: 'Giao siêu tốc 2h',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu6AWMC3uWThaPZ61dfWysBu-Nt1y_0QV5h6IxoDiKq4jiQ0o0KjfWZGtzBCO2e2QliuBff5bIrJrTB7j_LeJkkuBy0ZPLgWWKKMO5nf7_JrP_QHNV8MgLPlAKfU_bAvb45rF926efoftPtbur-SLtfCR_Lw7RwgUGtBhBN_h-33-qLGxMhCXJMMAPuu3mcJp4LObPJOfraVhFOHSilWkh3igzQRak6CdNFMHM330x'
  },
  {
    id: 'prod-2',
    title: 'Đầm Lụa Satin Suông Cổ V Đính Khuy Trai Thanh Lịch',
    category: 'dam-vay',
    brandTag: 'ShopVibe Mall',
    price: 790000,
    originalPrice: 990000,
    discountPercent: 20,
    rating: 5.0,
    reviewCount: 88,
    deliveryTag: 'Freeship Xtra',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiIkilL20Vwf9xcAXeIS9tSp_OYDBXM-eN7nPmUNtP5z5-nYaR2I7nkaXTFvW8DEnfMylJzrwae15bVCU-1QUKC04nUqGJVOpqw1PXto08cjlyRmwKTraLhHsOnv1NuSuWPUxSbp7GJzGCjh6RyJqzkKDDU2vXgORe3Bt6wIyy4IWoUzzRVjEhY-wLtn1GusObGypAd-KTGWdfF_iTwc1SHX7eEAAXArLnbxd1rp5o'
  },
  {
    id: 'prod-3',
    title: 'Túi Bucket Bag Da Mềm Khóa Kim Loại Tinh Xảo',
    category: 'tui-xach',
    brandTag: 'ShopVibe Mall',
    price: 1150000,
    originalPrice: 1550000,
    discountPercent: 25,
    rating: 4.8,
    reviewCount: 64,
    deliveryTag: 'Giao siêu tốc 2h',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcfjQtw2RwoccmcYFrXZkOEqvDJxl92ehhyuNUoJaFNX5zkhwncDG06pSQvr-hGSCEx_uOMVYrNrI3j67X_s3N0nbKISUtsoiJ2wmmdZkpEryxGZJVLSxvPmqg4XuwZ-r3QTl2hvgeuNu91NKgst3B-0OmBLz67QI4OPuhQv7Lb9J_K32HRbIlVXh3NSbyZ-9NsrOeuon0Q8W0dMaDPjVNojfkg-joAOaLPjZK4RZI'
  },
  {
    id: 'prod-4',
    title: 'Quần Tây Ống Rộng Xếp Ly Eo Cao Tôn Dáng Tinh Tế',
    category: 'ao-blazer',
    brandTag: 'ShopVibe Mall',
    price: 520000,
    originalPrice: 650000,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 210,
    deliveryTag: 'Freeship Xtra',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEkhN1WYacg4emygQieeOWJqL8ErVQpup23EHDBfo3W0KC7rFiJq13BMSArFUk_swJe1seBzj4XzHK0JZc0syI5uW1zHlphsvDoauV-aTq_QU3lUBUCzStuwdrTnNHsvJ7ziw0aMXR8iOZj54DYhwFLsvvndTYsFvqfiO07kwEZYAIBKNvRAVjop6RFiXvUl0P7UKoZ8qh3s9OHmG3naXFYmWjIFjMIJzO8t2j-rJ3'
  },
  {
    id: 'prod-5',
    title: 'Áo Dệt Kim Tay Ngắn Cổ Polo Tối Giản Màu Sand',
    category: 'len-thu-dong',
    brandTag: 'ShopVibe Mall',
    price: 450000,
    originalPrice: 580000,
    discountPercent: 22,
    rating: 4.7,
    reviewCount: 95,
    deliveryTag: 'Giao siêu tốc 2h',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0S48Yw4Dill2N_OQtvxP3oCAC7SYVou3xIuYOE2VXzujllQCMDa7FOzbJNwpXSQbdenxB7R3EEeVhalST42H3Eq4_n8Q-bT1rijclGKUTtPqS2OoS1rrQSjULFUxA6_2H305u6UMPusHj11YdGo0TySqn8QmxtrZoNL3HuOoz8viKkdamTKytvxlIyHz2JQmPibGUaAV1imiR96kwYPTPVIi9xhTljk-xSgDdFepl'
  },
  {
    id: 'prod-6',
    title: 'Giày Mules Da Gót Vuông 5cm Phong Cách Parisian',
    category: 'giay-boots',
    brandTag: 'ShopVibe Mall',
    price: 880000,
    originalPrice: 1100000,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 76,
    deliveryTag: 'Freeship Xtra',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0YVHbEgcOimmNHitO03yMGeB2Ac49AiobKoVBcCFY-QW6voPDKL81fmeI5qX4u43tXtP-Mb43YfwWstvapNO7IB-nJiVrGrWQg6AXtS8J6sCcUCNuM-fav-VpqRZv4dfvae40rMJhj5IMyAcwSyeWD5LQg2UQB0cHqfEoU3yY8wVuFBnGs-xNoJ5UDZXNBDRaKOviPabAA6sW1KTexJhNpDMmutiUZTlpuM8yH2-c'
  }
];
