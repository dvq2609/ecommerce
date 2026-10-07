import React, { useState, useEffect } from 'react';
import { HERO_SLIDES, type HeroSlide } from '../../services/mockHomeData';

interface HeroSliderProps {
  slides?: HeroSlide[];
  onCtaClick?: (slide: HeroSlide) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides = HERO_SLIDES,
  onCtaClick,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentIdx] || slides[0];
  if (!slide) return null;

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '6px 16px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
          backgroundColor: 'var(--color-surface-card)',
        }}
      >
        {/* Banner Content Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '210px',
            backgroundImage: `url(${slide.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            transition: 'background-image 0.5s ease-in-out',
          }}
        >
          {/* Subtle Dark Gradient Overlay for optimal legibility */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(27, 28, 28, 0.78) 0%, rgba(27, 28, 28, 0.45) 45%, rgba(27, 28, 28, 0.1) 100%)',
              zIndex: 1,
            }}
          />

          {/* Top Row: Tag & Slide Counter */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 2px 6px rgba(186, 0, 54, 0.3)',
              }}
            >
              {slide.badge}
            </span>

            <span
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(27, 28, 28, 0.45)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {currentIdx + 1}/{slides.length}
            </span>
          </div>

          {/* Middle/Bottom: Headline, Subtitle & CTA */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '380px',
              marginTop: '16px',
            }}
          >
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.25,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                letterSpacing: '-0.3px',
              }}
            >
              {slide.title}
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.92)',
                marginTop: '4px',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {slide.subtitle}
            </p>

            <div style={{ marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => onCtaClick?.(slide)}
                style={{
                  height: '38px',
                  padding: '0 18px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(186, 0, 54, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span>{slide.ctaText}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom-right Dots Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(27, 28, 28, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              aria-label={`Chuyển đến slide ${idx + 1}`}
              style={{
                width: idx === currentIdx ? '16px' : '6px',
                height: '6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: idx === currentIdx ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
