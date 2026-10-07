import React, { useState } from 'react';

interface ProductImageGalleryProps {
  images: string[];
  title: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
  activeIndex?: number;
  onSelectIndex?: (idx: number) => void;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  title,
  isLiked = false,
  onToggleLike,
  activeIndex: controlledIndex,
  onSelectIndex,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIdx = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const handleSelect = (idx: number) => {
    setInternalIndex(idx);
    onSelectIndex?.(idx);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (activeIdx - 1 + images.length) % images.length;
    handleSelect(nextIdx);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (activeIdx + 1) % images.length;
    handleSelect(nextIdx);
  };

  const currentImage = images[activeIdx] || images[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
      }}
    >
      {/* Main Image Showcase - Proportionally matches container & page */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/5',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: 'var(--color-surface-container-low)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <img
          src={currentImage}
          alt={`${title} - Hình ${activeIdx + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'opacity 0.25s ease',
          }}
        />

        {/* Floating Favorite Button */}
        <button
          type="button"
          aria-label="Thêm vào yêu thích"
          onClick={onToggleLike}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isLiked ? 'var(--color-primary)' : 'var(--color-on-surface)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'transform 0.15s ease',
            zIndex: 10,
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.88)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '20px',
              fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            favorite
          </span>
        </button>

        {/* Floating Slide Counter Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            right: '14px',
            padding: '4px 10px',
            backgroundColor: 'rgba(27, 28, 28, 0.72)',
            backdropFilter: 'blur(6px)',
            borderRadius: '9999px',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            zIndex: 10,
          }}
        >
          <span>{activeIdx + 1}</span>
          <span style={{ opacity: 0.6 }}>/</span>
          <span style={{ opacity: 0.85 }}>{images.length}</span>
        </div>

        {/* Prev / Next Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Ảnh trước"
              onClick={handlePrev}
              style={{
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-on-surface)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 10,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                chevron_left
              </span>
            </button>

            <button
              type="button"
              aria-label="Ảnh kế tiếp"
              onClick={handleNext}
              style={{
                position: 'absolute',
                top: '50%',
                right: '10px',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-on-surface)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 10,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                chevron_right
              </span>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Selector Strip */}
      {images.length > 1 && (
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            padding: '2px 0',
            width: '100%',
          }}
        >
          {images.map((img, idx) => {
            const isSelected = idx === activeIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border-subtle)',
                  boxShadow: isSelected ? '0 0 0 2px rgba(186, 0, 54, 0.2)' : 'none',
                  opacity: isSelected ? 1 : 0.7,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-surface-container)',
                }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
