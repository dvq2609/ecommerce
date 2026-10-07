import React from 'react';
import type { ProductDetailData } from '../../types/productDetail';

interface ProductInfoSectionProps {
  product: ProductDetailData;
}

export const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({ product }) => {
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('vi-VN').format(p) + '₫';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Badges strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {product.isMall && (
          <span
            style={{
              padding: '3px 10px',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-full)',
              fontSize: '11.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              verified
            </span>
            {product.brandTag}
          </span>
        )}

        {product.isNewArrival && (
          <span
            style={{
              padding: '3px 8px',
              backgroundColor: 'var(--color-surface-container-high)',
              color: 'var(--color-on-surface)',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            New Arrival
          </span>
        )}

        <span
          style={{
            marginLeft: 'auto',
            padding: '3px 8px',
            backgroundColor: '#d0f8f1',
            color: '#006a62',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            local_shipping
          </span>
          {product.shippingTag}
        </span>
      </div>

      {/* Collection tag & Main Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-primary)',
          }}
        >
          {product.collectionTag}
        </span>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--color-on-surface)',
            lineHeight: 1.35,
            letterSpacing: '-0.015em',
          }}
        >
          {product.title}
        </h2>
      </div>

      {/* Rating & Social Proof Stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          fontSize: '13px',
          color: 'var(--color-on-surface-variant)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-on-surface)' }}>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '18px',
              color: '#f59e0b',
              fontVariationSettings: "'FILL' 1",
            }}
          >
            star
          </span>
          <span style={{ fontWeight: 800 }}>{product.rating}</span>
          <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px' }}>
            ({product.ratingCount >= 1000 ? `${(product.ratingCount / 1000).toFixed(1)}k` : product.ratingCount})
          </span>
        </div>

        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-outline)' }} />
        <span>Đã bán {product.soldCountText}</span>

        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-outline)' }} />
        <span style={{ color: '#006a62', fontWeight: 600 }}>{product.satisfactionRate}</span>
      </div>

      {/* Price Container */}
      <div
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface-container-low)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {formatPrice(product.price)}
          </span>

          {product.originalPrice > product.price && (
            <span
              style={{
                fontSize: '15px',
                color: 'var(--color-on-surface-variant)',
                textDecoration: 'line-through',
                opacity: 0.75,
              }}
            >
              {formatPrice(product.originalPrice)}
            </span>
          )}

          {product.discountPercent > 0 && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-fixed)',
                color: 'var(--color-on-primary-fixed)',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {product.savingsAmount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-on-surface-variant)',
              fontSize: '12px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#006a62' }}>
              savings
            </span>
            <span>Tiết kiệm {formatPrice(product.savingsAmount)} so với giá niêm yết</span>
          </div>
        )}
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
