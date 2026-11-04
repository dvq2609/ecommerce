import React from 'react';
import type { ProductDetailData } from '../../types/productDetail';

interface ProductInfoSectionProps {
  product: ProductDetailData;
  displayPrice?: number;
}

export const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({ product, displayPrice }) => {
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('vi-VN').format(p) + '₫';
  };

  const currentPrice = displayPrice && displayPrice > 0 ? displayPrice : product.price;
  const currentSavings = product.originalPrice > currentPrice ? product.originalPrice - currentPrice : product.savingsAmount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Badges strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {product.isMall && (
          <span
            style={{
              padding: '4px 10px',
              backgroundColor: 'var(--nike-black, #111111)',
              color: '#ffffff',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.04em',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              verified
            </span>
            {product.brandTag || 'SHOPVIBE OFFICIAL'}
          </span>
        )}

        {product.isNewArrival && (
          <span
            style={{
              padding: '4px 10px',
              backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
              color: 'var(--nike-black, #111111)',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              border: '1px solid var(--nike-hairline, #e5e5e5)',
            }}
          >
            Mới Ra Mắt
          </span>
        )}

        <span
          style={{
            marginLeft: 'auto',
            padding: '4px 10px',
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            border: '1px solid #dcfce7',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            local_shipping
          </span>
          {product.shippingTag || 'Freeship'}
        </span>
      </div>

      {/* Collection kicker & Main Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--nike-sale, #d30005)',
          }}
        >
          {product.collectionTag || 'BST THỜI TRANG CAO CẤP'}
        </span>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: 'var(--nike-black, #111111)',
            lineHeight: 1.28,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {product.title}
        </h1>
      </div>

      {/* Rating & Social Proof Stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          fontSize: '13px',
          color: 'var(--nike-gray, #707072)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--nike-black, #111111)' }}>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '17px',
              color: '#f59e0b',
              fontVariationSettings: "'FILL' 1",
            }}
          >
            star
          </span>
          <span style={{ fontWeight: 800 }}>{product.rating}</span>
          <span style={{ color: 'var(--nike-gray, #707072)', fontSize: '12px' }}>
            ({product.ratingCount >= 1000 ? `${(product.ratingCount / 1000).toFixed(1)}k` : product.ratingCount})
          </span>
        </div>

        <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--nike-hairline, #e5e5e5)' }} />
        <span>Đã bán {product.soldCountText}</span>

        <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--nike-hairline, #e5e5e5)' }} />
        <span style={{ color: '#15803d', fontWeight: 600 }}>{product.satisfactionRate} hài lòng</span>
      </div>

      {/* Price Container - Clean Apple Card style */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
          border: '1px solid var(--nike-hairline, #e5e5e5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--nike-black, #111111)',
              letterSpacing: '-0.02em',
            }}
          >
            {formatPrice(currentPrice)}
          </span>

          {product.originalPrice > currentPrice && (
            <span
              style={{
                fontSize: '16px',
                color: 'var(--nike-gray, #707072)',
                textDecoration: 'line-through',
                fontWeight: 500,
              }}
            >
              {formatPrice(product.originalPrice)}
            </span>
          )}

          {product.discountPercent > 0 && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'var(--nike-sale, #d30005)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.02em',
              }}
            >
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {currentSavings > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#15803d',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              savings
            </span>
            <span>Tiết kiệm {formatPrice(currentSavings)} so với giá niêm yết</span>
          </div>
        )}
      </div>

      {/* Seller Information Card - Apple Hairline Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderRadius: '14px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--nike-hairline, #e5e5e5)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--nike-black, #111111)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '16px',
              flexShrink: 0,
            }}
          >
            {(product.sellerName || 'S').charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--nike-black, #111111)' }}>
                {product.sellerName || 'ShopVibe Official Store'}
              </span>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '16px', color: '#2563eb' }}
                title="Người bán đã xác thực"
              >
                verified
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--nike-gray, #707072)' }}>
              Người bán uy tín • Đối tác chính thức
            </span>
          </div>
        </div>
      </div>

      {/* Exclusive Vouchers & Promos */}
      {product.vouchers && product.vouchers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            Ưu đãi & Voucher độc quyền
          </span>
          <div
            className="no-scrollbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              padding: '2px 0',
            }}
          >
            {product.vouchers.map((v) => (
              <div
                key={v.id}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: v.type === 'discount' ? 'var(--color-primary-fixed)' : '#e0f2fe',
                  color: v.type === 'discount' ? 'var(--color-on-primary-fixed)' : '#0369a1',
                  border: '1px solid rgba(0,0,0,0.06)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  {v.type === 'discount' ? 'confirmation_number' : v.type === 'shipping' ? 'local_shipping' : 'monetization_on'}
                </span>
                <span>{v.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
