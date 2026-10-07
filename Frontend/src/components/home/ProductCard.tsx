import React from 'react';
import type { ProductCatalogItem } from '../../services/mockHomeData';

interface ProductCardProps {
  product: ProductCatalogItem;
  isLiked?: boolean;
  onToggleLike?: (id: string) => void;
  onClick?: (product: ProductCatalogItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isLiked = false,
  onToggleLike,
  onClick,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  return (
    <div
      onClick={() => onClick?.(product)}
      role="button"
      tabIndex={0}
      style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Product Image & Badges */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1/1',
          overflow: 'hidden',
          backgroundColor: 'var(--color-surface-container)',
        }}
      >
        <img
          src={product.imageUrl}
          alt={product.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            -{product.discountPercent}%
          </span>
        )}

        {/* Like Button */}
        <button
          type="button"
          aria-label="Yêu thích"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike?.(product.id);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isLiked ? 'var(--color-primary)' : 'var(--color-on-surface)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.88)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '18px',
              fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            {isLiked ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </div>

      {/* Product Details */}
      <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Brand Tag */}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
            }}
          >
            {product.brandTag}
          </span>

          {/* Title */}
          <h4
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--color-on-surface)',
              marginTop: '4px',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '36px',
            }}
            title={product.title}
          >
            {product.title}
          </h4>

          {/* Rating & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '14px',
                color: '#f59e0b',
                fontVariationSettings: "'FILL' 1",
              }}
            >
              star
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              {product.rating}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
              ({product.reviewCount})
            </span>
          </div>

          {/* Prices */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: 'var(--color-primary)',
              }}
            >
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span
                style={{
                  fontSize: '11.5px',
                  color: 'var(--color-on-surface-variant)',
                  textDecoration: 'line-through',
                }}
              >
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Delivery / Extra Badge */}
        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--color-border-subtle)' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10.5px',
              fontWeight: 600,
              color: product.deliveryTag.includes('2h') ? '#006a62' : '#8d4b00',
              backgroundColor: product.deliveryTag.includes('2h') ? '#d0f8f1' : '#ffdcc3',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}
            >
              {product.deliveryTag.includes('2h') ? 'bolt' : 'local_shipping'}
            </span>
            {product.deliveryTag}
          </span>
        </div>
      </div>
    </div>
  );
};
