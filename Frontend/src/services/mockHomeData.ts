import type { HeroSlide, TrustBadge } from '../types/home';
export * from '../types/home';

export const CITIES_LIST = [
  'Hà Nội, Q. Cầu Giấy',
  'TP. Hồ Chí Minh, Q. 1',
  'Đà Nẵng, Q. Hải Châu',
  'Hải Phòng, Q. Ngô Quyền',
  'Cần Thơ, Q. Ninh Kiều',
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
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'slide-2',
    badge: 'EXCLUSIVE VIBE',
    slideNumber: '2/3',
    title: 'Urban Chic Autumn',
    subtitle: 'Voucher 100k cho đơn từ 499k',
    ctaText: 'Mua ngay',
    ctaLink: '/catalog?trend=urban',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'slide-3',
    badge: 'MALL LUXE SELECTION',
    slideNumber: '3/3',
    title: 'Phụ Kiện Da Cao Cấp',
    subtitle: 'Bảo hành chính hãng 12 tháng',
    ctaText: 'Xem bộ sưu tập',
    ctaLink: '/catalog?cat=bags',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80',
  },
];

export const TRUST_BADGES: TrustBadge[] = [
  {
    id: 'trust-1',
    icon: 'verified',
    title: '100% Chính Hãng',
    subtitle: 'Hoàn tiền gấp 2 nếu giả',
  },
  {
    id: 'trust-2',
    icon: 'published_with_changes',
    title: 'Đổi Trả 30 Ngày',
    subtitle: 'Thủ tục nhanh gọn',
  },
  {
    id: 'trust-3',
    icon: 'local_shipping',
    title: 'Giao Siêu Tốc 2H',
    subtitle: 'Miễn phí đơn từ 300k',
  },
];
