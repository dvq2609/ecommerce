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
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentIdx] || slides[0];
  if (!slide) return null;

  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        padding: '12px 20px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#111111',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Banner Image & Gradient Overlay */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '440px',
            backgroundImage: `url(${slide.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '40px 36px',
            transition: 'background-image 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="hero-banner-inner"
        >
          {/* Editorial Gradient Vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(17, 17, 17, 0.15) 0%, rgba(17, 17, 17, 0.45) 50%, rgba(17, 17, 17, 0.9) 100%)',
              zIndex: 1,
            }}
          />

          {/* Top Badge & Slide Counter */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '28px',
              right: '28px',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#d30005',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {slide.badge || 'BỘ SƯU TẬP 2026'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {/* Prev / Next Minimalist Arrows */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(12px)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.35)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  chevron_left
                </span>
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(12px)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.35)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Hero Editorial Typography & Actions */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '680px',
            }}
          >
            <div
              className="font-kicker"
              style={{
                color: 'rgba(255, 255, 255, 0.75)',
                marginBottom: '8px',
                fontSize: '12px',
                letterSpacing: '0.14em',
              }}
            >
              LOOKBOOK EDITION • SHOPVIBE EXCLUSIVE
            </div>

            <h1
              className="font-display-campaign"
              style={{
                color: '#ffffff',
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                margin: 0,
              }}
            >
              {slide.title}
            </h1>

            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.88)',
                marginTop: '12px',
                lineHeight: 1.5,
                maxWidth: '480px',
              }}
            >
              {slide.subtitle || 'Khám phá các thiết kế thời trang may đo cao cấp với chất liệu tự nhiên bền vững.'}
            </p>

            {/* Nike Full-Pill Call to Actions */}
            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => onCtaClick?.(slide)}
                className="btn-pill-secondary"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#111111',
                  padding: '12px 28px',
                  fontWeight: 700,
                  fontSize: '14.5px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                }}
              >
                <span>{slide.ctaText || 'Khám Phá Ngay'}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = document.querySelector('#catalog-section');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-pill-ghost"
                style={{
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  padding: '12px 24px',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <span>Xem Lookbook</span>
              </button>
            </div>
          </div>

          {/* Bottom Dots Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '28px',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Slide ${idx + 1}`}
                style={{
                  width: idx === currentIdx ? '28px' : '8px',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: idx === currentIdx ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hero-banner-inner {
            min-height: 360px !important;
            padding: 24px 18px !important;
          }
        }
      `}</style>
    </div>
  );
};
