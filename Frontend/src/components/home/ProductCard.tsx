import React, { useState } from 'react';
import type { ProductCatalogItem } from '../../types/home';

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
  const [selectedColorIdx, setSelectedColorIdx] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  // Determine active display image: chosen swatch > hover secondary > default primary
  const colors = product.colors || [];
  let displayImage = product.imageUrl;
  if (selectedColorIdx !== null && colors[selectedColorIdx]?.imageUrl) {
    displayImage = colors[selectedColorIdx].imageUrl!;
  } else if (isHovered && product.secondaryImageUrl) {
    displayImage = product.secondaryImageUrl;
  }

  return (
    <div
      onClick={() => onClick?.(product)}
      role="button"
      tabIndex={0}
      className="card-hairline"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '18px',
        backgroundColor: '#ffffff',
        position: 'relative',
        textDecoration: 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick?.(product);
      }}
    >
      {/* 1. Image Container (3:4 Fashion Photography Ratio) */}
      <div
        className="img-zoom-parent"
        style={{
          width: '100%',
          aspectRatio: '3 / 4',
          borderRadius: '12px',
          position: 'relative',
          backgroundColor: '#f5f5f7',
        }}
      >
        <img
          src={displayImage}
          alt={product.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'opacity 0.25s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          loading="lazy"
        />

        {/* Top-Left Tag: Sale or Just In */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {product.discountPercent > 0 ? (
            <span className="tag-pill-sale">
              -{product.discountPercent}%
            </span>
          ) : (
            <span className="tag-pill-new">
              Mới
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
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
            zIndex: 2,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            color: isLiked ? '#d30005' : '#111111',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
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
            favorite
          </span>
        </button>
      </div>

      {/* 2. Color Swatches Pill Row */}
      {colors.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 4px 4px 4px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {colors.slice(0, 5).map((color, idx) => (
            <span
              key={color.colorId || idx}
              title={color.colorName}
              className={`swatch-dot ${selectedColorIdx === idx ? 'active' : ''}`}
              style={{
                backgroundColor: color.hexCode,
              }}
              onClick={() => setSelectedColorIdx(idx)}
            />
          ))}
          {colors.length > 5 && (
            <span style={{ fontSize: '11px', color: '#707072', fontWeight: 600 }}>
              +{colors.length - 5}
            </span>
          )}
        </div>
      )}

      {/* 3. Product Details */}
      <div
        style={{
          padding: colors.length > 0 ? '4px 4px 4px 4px' : '10px 4px 4px 4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* Category & Brand Kicker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: '#707072',
            fontWeight: 600,
          }}
        >
          <span>{product.brandTag}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#111111', fontWeight: 700 }}>
            ⭐ {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
          </span>
        </div>

        {/* Product Title */}
        <h4
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#111111',
            lineHeight: 1.35,
            margin: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            letterSpacing: '-0.01em',
            minHeight: '38px',
          }}
        >
          {product.title}
        </h4>

        {/* Price Row: Current bold black + Original strikethrough */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            marginTop: '2px',
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#111111',
              letterSpacing: '-0.02em',
            }}
          >
            {formatPrice(product.price)}
          </span>

          {product.discountPercent > 0 && (
            <span
              style={{
                fontSize: '12.5px',
                color: '#707072',
                textDecoration: 'line-through',
                fontWeight: 500,
              }}
            >
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
