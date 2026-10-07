import React, { useState, useEffect } from 'react';
import { FLASH_SALE_PRODUCTS, type FlashSaleItem } from '../../services/mockHomeData';

interface FlashSaleSectionProps {
  products?: FlashSaleItem[];
  onProductClick?: (product: FlashSaleItem) => void;
  onViewAll?: () => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products = FLASH_SALE_PRODUCTS,
  onProductClick,
  onViewAll,
}) => {
  // Countdown Timer: 2 hours, 14 minutes, 35 seconds initial countdown
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 14 * 60 + 35);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 24 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '12px 0',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="material-symbols-outlined"
            style={{
              color: 'var(--color-primary)',
              fontSize: '24px',
              fontVariationSettings: "'FILL' 1",
            }}
          >
            bolt
          </span>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.3px',
            }}
          >
            Flash Sale
          </h3>

          {/* Countdown Boxes */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '4px',
              fontWeight: 700,
              fontSize: '11px',
              color: 'var(--color-on-surface)',
            }}
          >
            <span
              style={{
                backgroundColor: 'var(--color-on-surface)',
                color: '#ffffff',
                padding: '2px 5px',
                borderRadius: '4px',
                minWidth: '22px',
                textAlign: 'center',
              }}
            >
              {hours}
            </span>
            <span>:</span>
            <span
              style={{
                backgroundColor: 'var(--color-on-surface)',
                color: '#ffffff',
                padding: '2px 5px',
                borderRadius: '4px',
                minWidth: '22px',
                textAlign: 'center',
              }}
            >
              {minutes}
            </span>
            <span>:</span>
            <span
              style={{
                backgroundColor: 'var(--color-on-surface)',
                color: '#ffffff',
                padding: '2px 5px',
                borderRadius: '4px',
                minWidth: '22px',
                textAlign: 'center',
              }}
            >
              {seconds}
            </span>
          </div>
        </div>

        {/* View All link */}
        <button
          type="button"
          onClick={onViewAll}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-primary)',
            cursor: 'pointer',
          }}
        >
          <span>Xem tất cả</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            chevron_right
          </span>
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          padding: '4px 16px 12px 16px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {products.map((item) => {
          const isLiked = !!likes[item.id];
          const soldPercentage = Math.round((item.soldCount / item.totalStock) * 100);

          return (
            <div
              key={item.id}
              onClick={() => onProductClick?.(item)}
              role="button"
              tabIndex={0}
              style={{
                width: '180px',
                flexShrink: 0,
                backgroundColor: 'var(--color-surface-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '8px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* Image & Badges */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1/1',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-surface-container)',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />

                {/* Discount Badge */}
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  -{item.discountPercent}%
                </span>

                {/* Wishlist Like Button */}
                <button
                  type="button"
                  aria-label="Thêm vào yêu thích"
                  onClick={(e) => toggleLike(e, item.id)}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '28px',
                    height: '28px',
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
                      fontSize: '16px',
                      fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {isLiked ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              </div>

              {/* Product Info */}
              <div style={{ paddingTop: '8px', paddingLeft: '4px', paddingRight: '4px' }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'block',
                  }}
                >
                  {item.brandTag}
                </span>

                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-on-surface)',
                    marginTop: '2px',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={item.title}
                >
                  {item.title}
                </h4>

                {/* Prices */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px',
                    marginTop: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: 'var(--color-primary)',
                    }}
                  >
                    {formatPrice(item.price)}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-on-surface-variant)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {formatPrice(item.originalPrice)}
                  </span>
                </div>

                {/* Progress Bar of Sold Items */}
                <div style={{ marginTop: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color:
                          soldPercentage > 85 ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                      }}
                    >
                      {soldPercentage > 85 ? '🔥 Sắp hết' : `Đã bán ${soldPercentage}%`}
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-surface-container-highest)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${soldPercentage}%`,
                        height: '100%',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-primary)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
