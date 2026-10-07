import React from 'react';
import type { RecommendedProduct } from '../../types/productDetail';

interface ProductRecommendationsProps {
  items: RecommendedProduct[];
  onSelectProduct?: (item: RecommendedProduct) => void;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  items,
  onSelectProduct,
}) => {
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('vi-VN').format(p) + '₫';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        backgroundColor: 'var(--color-surface-card)',
        padding: '20px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
          Gợi ý phối đồ
        </h3>
        <button
          type="button"
          onClick={() => alert('Đang mở toàn bộ bộ sưu tập phối đồ')}
          style={{
            fontSize: '12.5px',
            color: 'var(--color-primary)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          Xem tất cả
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            chevron_right
          </span>
        </button>
      </div>

      {/* Grid of Recommended Products */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectProduct?.(item)}
            role="button"
            tabIndex={0}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-border-subtle)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Image Box */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '3/4',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-surface-container)',
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: item.tag.includes('Bán chạy') ? 'var(--color-primary)' : 'rgba(27,28,28,0.75)',
                  color: '#ffffff',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                }}
              >
                {item.tag}
              </span>
            </div>

            {/* Title & Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-on-surface)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={item.title}
              >
                {item.title}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                {item.subtitle}
              </span>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {formatPrice(item.price)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '12px', color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span>{item.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
