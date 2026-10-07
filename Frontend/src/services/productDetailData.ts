import type { ProductDetailData } from '../types/productDetail';
import { MAIN_CATALOG_PRODUCTS } from './mockHomeData';

export const FLAGSHIP_BLAZER_DETAIL: ProductDetailData = {
  id: 'prod-blazer-flagship',
  sku: 'VIBE-BZ-809',
  title: 'Áo Blazer Oversize Cổ Điển - Form Rộng Phong Cách Hàn Quốc',
  collectionTag: 'Bộ Sưu Tập Thu Đông 2024',
  brandTag: 'ShopVibe Mall',
  isMall: true,
  isNewArrival: true,
  shippingTag: 'Sẵn hàng',
  price: 890000,
  originalPrice: 1200000,
  discountPercent: 26,
  savingsAmount: 310000,
  rating: 4.9,
  ratingCount: 1240,
  soldCountText: '2.4k',
  satisfactionRate: '99% Hài lòng',
  vouchers: [
    { id: 'v-1', text: 'Giảm 50k', type: 'discount' },
    { id: 'v-2', text: 'Freeship Extra', type: 'shipping' },
    { id: 'v-3', text: 'Hoàn 10% Xu', type: 'cashback' }
  ],
  images: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDBeyveUJSxoNSCxBaKQHEZbd9uTkReO7bSa3hgnESMm0t1RZYsu1loTNYdO2uFUPX8bOBvHdGRV6lleESwDtt1DhXk9Wm55l2l8eX0GhC3Y__wSKcBMs5nVAuya1z7IRpqIhRYOuljLQ-0aCcXf-LPbTSKc6yvOH-EKsNnHeAxUfkNfGsOTiyW4jZtTkraK9evJXs72ETRl6atsE6uJzU82lWE_IFUbbGC7wmsa4kS',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBQj2G1A7AI7tEmjMYjsBdGIXZT1ZCSfp2H4ZUj1DLvgz2bvFSEyPMQJx6ZlGfKj9E0VUp1Q33B540UIcVhlyi5LF5sOASVfbqACXU0VhrcoRCvM9FCxXAODWZAcij4xsrm3rdlpEQPQVpEP6f7dEk-vNpz5ne1_My-cIFzStFUlDqKRFXI_vicCY7v_5HhFjq9UCdL5nf9dzjJVBsO855IpU-0VXXzyG6Is3-ubQ_o',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB8Zi7LeVOjVyEaL02bW6IaD3yDGohI8aVIeT_KOrJ6H-lpYtNZ3eRYv4qGI5vohbPmp3VBxgnxz-9RZyzVJEXYDCQEKRupdO12hfOqXCvGCi8ihgFIndtH2yQZBKM9r9Sh0hAObELQ9vyYyYEAyKUtu2m50OH_Mcklb4i-rkogcLCbcLxdj1Uele4uSqwTUMPdPSTowZ638XkhG0Px_0UPdSzKY2Elc182PcDDmNSe',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8C0qpYZL-GYa1CxAJYhrMcnuUqaz_36xeALs0vMvsoolEDwj3_8GS3Z0UB8XY1M850fNOyiP7pzdNBh8Sk9UOTooF01HBS6zPt25V-u-ROcD_t8c7fGmMLbRLxOjNN-sotMJ8rdmF0bUM7HBEDRI5tH6pPRGjjadLFVxDbTP32-qc6yqoFDYc_FnMR_HvsyBiLksLkqGsp3uQVWPF2Dn4yWDLQyoPad_qquqylNv8',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCu6AWMC3uWThaPZ61dfWysBu-Nt1y_0QV5h6IxoDiKq4jiQ0o0KjfWZGtzBCO2e2QliuBff5bIrJrTB7j_LeJkkuBy0ZPLgWWKKMO5nf7_JrP_QHNV8MgLPlAKfU_bAvb45rF926efoftPtbur-SLtfCR_Lw7RwgUGtBhBN_h-33-qLGxMhCXJMMAPuu3mcJp4LObPJOfraVhFOHSilWkh3igzQRak6CdNFMHM330x'
  ],
  colors: [
    { id: 'c-1', name: 'Kem Vintage', hex: '#E8E0D5', imageIndex: 0 },
    { id: 'c-2', name: 'Đen Classic', hex: '#1F1F1F', imageIndex: 1 },
    { id: 'c-3', name: 'Nâu Cacao', hex: '#5C4033', imageIndex: 2 }
  ],
  sizes: [
    { id: 's-s', name: 'S', description: '45-52kg', inStock: true },
    { id: 's-m', name: 'M', description: '53-58kg', inStock: true },
    { id: 's-l', name: 'L', description: '59-65kg', inStock: true },
    { id: 's-xl', name: 'XL', description: '66-72kg', inStock: false }
  ],
  stockQuantity: 48,
  shippingEstimate: {
    deliveryDateText: 'Thứ Năm, 16 Th10',
    description: 'Nhanh (Dự kiến 2-3 ngày làm việc)',
    freeShippingThresholdText: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 299.000₫'
  },
  guarantees: [
    {
      title: 'Đổi trả 30 ngày',
      subtitle: 'Miễn phí tận nơi',
      icon: 'published_with_changes'
    },
    {
      title: 'Chính hãng 100%',
      subtitle: 'Đền bù 200% nếu giả',
      icon: 'verified_user'
    }
  ],
  specs: [
    { label: 'Chất liệu', value: 'Wool Blend cao cấp, lót lụa mềm mại' },
    { label: 'Xuất xứ', value: 'Việt Nam thiết kế & may thủ công' },
    { label: 'Phong cách', value: 'Tối giản, Thanh lịch, Công sở & Dạo phố' },
    { label: 'Kiểu dáng', value: 'Oversize form rộng, ve áo chữ K cổ điển' },
    { label: 'Chăm sóc vải', value: 'Giặt khô hoặc giặt tay nước mát' }
  ],
  descriptionText:
    'Chiếc áo Blazer Oversize Cổ Điển mang lại nét chấm phá thời thượng lấy cảm hứng từ phong cách Parisian Chic pha lẫn đường nét phóng khoáng đương đại. Thân áo cấu trúc 2 lớp với lớp nẹp đệm vai tự nhiên, giữ phom dáng vững chắc mà không tạo cảm giác nặng nề. Phù hợp phối cùng sơ mi minimalist hoặc áo thun basic cho cả ngày làm việc lẫn những buổi cafe tối thanh lịch.',
  reviewsDistribution: [
    { stars: 5, percentage: 88 },
    { stars: 4, percentage: 8 },
    { stars: 3, percentage: 2 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 }
  ],
  reviews: [
    {
      id: 'rev-1',
      userName: 'Ngọc Lan Vũ',
      avatarLetter: 'L',
      rating: 5,
      timeAgo: '2 ngày trước',
      variantInfo: 'Phân loại: Kem Vintage • Size M',
      comment:
        'Áo cực kỳ tôn dáng, chất len dệt đầm tay và lót lụa mịn mát. Mặc lên form chuẩn oversize Hàn Quốc không bị nuốt dáng. Đóng gói hộp rất kỹ càng kèm túi chống bụi! Rất đáng tiền.',
      isVerifiedPurchase: true,
      userPhotos: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD8C0qpYZL-GYa1CxAJYhrMcnuUqaz_36xeALs0vMvsoolEDwj3_8GS3Z0UB8XY1M850fNOyiP7pzdNBh8Sk9UOTooF01HBS6zPt25V-u-ROcD_t8c7fGmMLbRLxOjNN-sotMJ8rdmF0bUM7HBEDRI5tH6pPRGjjadLFVxDbTP32-qc6yqoFDYc_FnMR_HvsyBiLksLkqGsp3uQVWPF2Dn4yWDLQyoPad_qquqylNv8',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBP_RGXwjo3ge_J_Qp0hj-rrQCtU_TV3qSRu231jL1KM_4xeHtiJaW0SYoxicoaNHCJiaEy6qkrak_cNsLvu0eGjWpR02Qgj6AC_sX6GqQpMC5U9XY49cLhU2MRDpce-k17SgOXmJ1HBDCDTftKlq2rgmjN0_ILVPxeRXO8ZtWvMoBzp-V5lg2Y8IZ4MtCzvO7RK6kEOLLZhdAkePG3e6Dt7h2DAa8qdnS-38Ho0gX-'
      ]
    },
    {
      id: 'rev-2',
      userName: 'Trần Minh Tâm',
      avatarLetter: 'T',
      rating: 5,
      timeAgo: '1 tuần trước',
      variantInfo: 'Phân loại: Đen Classic • Size L',
      comment:
        'Màu đen tuyền sang chảnh, đường kim mũi chỉ tỉ mỉ không có chỉ thừa. Đi làm hay khoác ngoài váy lụa đi tiệc đều rất đỉnh. Giao hàng 2 ngày là nhận được.',
      isVerifiedPurchase: true
    }
  ],
  recommendations: [
    {
      id: 'rec-1',
      title: 'Quần Tây Ống Suông Xếp Ly',
      subtitle: 'Form dáng thanh lịch',
      tag: 'Gợi ý mix',
      price: 520000,
      rating: 4.9,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDVJLXkJzi_5rB7TCP2JSpOMhG2RuqQwzoz4IWnEQW-WeGUlMGsAdg2JV47ThQ_rQ1DASYhga6WuEkSWtV5awfaNTZ2a6svwx1vd7ujT81PgKRuoVrSppd0NPMemM8K72hFdI3PvJlEuv2BD8_aFO61G7B32NNjWWT9rRGQ585KyZ_1UFO_HEqCfz89NOjEBn3D23FaudDGr4J5E7H32Y_4NMUjJm5Y-qMJJUExr70a'
    },
    {
      id: 'rec-2',
      title: 'Túi Xách Da Tối Giản Vibe Luxe',
      subtitle: 'Da bò thuộc cao cấp',
      tag: 'Bán chạy',
      price: 1450000,
      rating: 5.0,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCGOr1biJuHBy1HtSil8eCiHR_F2Bkycim4b6Wv4pu8lSCRBsAXBou0TACwm0kyl3RUZdOWi8ERjrdMfq5D3oD5IgyFhvNyy6iNpVGOV6Ia1-EXwEz9UwwRDw4YHmkueZZP0-bu1qfgTtVs91G2PDdcPt5Zcgbl7pk7gujuUMwdvickGK2-8AjOm13jGjouOY4f_YWBY3BvDeedNMkzia0WuXww7tYC4lyV_M0KIV61'
    }
  ]
};

/**
 * Tạo dữ liệu chi tiết cho bất kỳ ID sản phẩm nào, kế thừa các giá trị từ danh mục
 */
export function getProductDetailFallback(idOrSlug: string): ProductDetailData {
  const found = MAIN_CATALOG_PRODUCTS.find((p) => p.id === idOrSlug || p.id === `prod-${idOrSlug}`);
  if (!found) {
    return FLAGSHIP_BLAZER_DETAIL;
  }

  return {
    ...FLAGSHIP_BLAZER_DETAIL,
    id: found.id,
    sku: `VIBE-${found.id.toUpperCase()}`,
    title: found.title,
    price: found.price,
    originalPrice: found.originalPrice,
    discountPercent: found.discountPercent,
    savingsAmount: found.originalPrice - found.price,
    rating: found.rating,
    images: [
      found.imageUrl,
      FLAGSHIP_BLAZER_DETAIL.images[1],
      FLAGSHIP_BLAZER_DETAIL.images[2],
      FLAGSHIP_BLAZER_DETAIL.images[3],
      FLAGSHIP_BLAZER_DETAIL.images[4]
    ]
  };
}
