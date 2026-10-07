import React, { useState } from 'react';
import type { ProductDetailData } from '../../types/productDetail';

interface ProductReviewsSectionProps {
  rating: number;
  ratingCount: number;
  distribution: ProductDetailData['reviewsDistribution'];
  reviews: ProductDetailData['reviews'];
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  rating,
  ratingCount,
  distribution,
  reviews,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        backgroundColor: 'var(--color-surface-card)',
        padding: '20px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header & Overall Rating */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
            Đánh giá từ khách hàng
          </h3>
          <span style={{ fontSize: '12.5px', color: 'var(--color-on-surface-variant)' }}>
            {new Intl.NumberFormat('vi-VN').format(ratingCount)} người mua đã đánh giá sản phẩm
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-surface-container-low)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-on-surface)' }}>
            {rating}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>/ 5.0</span>
        </div>
      </div>

      {/* Distribution Bars */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '14px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface-container-low)',
        }}
      >
        {distribution.map((d) => (
          <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
            <span style={{ width: '42px', color: 'var(--color-on-surface)', fontWeight: 600 }}>
              {d.stars} sao
            </span>
            <div
              style={{
                flex: 1,
                height: '7px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-surface-container-high)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${d.percentage}%`,
                  height: '100%',
                  borderRadius: '9999px',
                  backgroundColor: '#f59e0b',
                }}
              />
            </div>
            <span style={{ width: '32px', textAlign: 'right', color: 'var(--color-on-surface-variant)' }}>
              {d.percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* Customer Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {reviews.map((rev, idx) => (
          <div
            key={rev.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingBottom: idx < reviews.length - 1 ? '16px' : '0',
              borderBottom: idx < reviews.length - 1 ? '1px solid var(--color-surface-container)' : 'none',
            }}
          >
            {/* Reviewer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-fixed)',
                    color: 'var(--color-on-primary-fixed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  {rev.avatarLetter || rev.userName.charAt(0)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                    {rev.userName}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', color: '#f59e0b' }}>
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '13px',
                            fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    {rev.isVerifiedPurchase && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#006a62',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                          check_circle
                        </span>
                        Đã mua hàng
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span style={{ fontSize: '11.5px', color: 'var(--color-on-surface-variant)' }}>
                {rev.timeAgo}
              </span>
            </div>

            {/* Variant tag */}
            <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              {rev.variantInfo}
            </span>

            {/* Comment */}
            <p style={{ fontSize: '13.5px', color: 'var(--color-on-surface)', lineHeight: 1.5 }}>
              {rev.comment}
            </p>

            {/* Customer Photos */}
            {rev.userPhotos && rev.userPhotos.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                {rev.userPhotos.map((photo, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setSelectedImage(photo)}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--color-surface-container)',
                      border: '1px solid var(--color-border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={photo}
                      alt="Ảnh phản hồi của khách hàng"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Button to see all reviews */}
      <button
        type="button"
        onClick={() => alert(`Đang tải toàn bộ ${ratingCount} đánh giá từ khách hàng`)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-surface-container-low)',
          color: 'var(--color-on-surface)',
          fontSize: '13.5px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          border: '1px solid var(--color-border-subtle)',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)')}
      >
        <span>Xem tất cả {new Intl.NumberFormat('vi-VN').format(ratingCount)} đánh giá</span>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          chevron_right
        </span>
      </button>

      {/* Photo Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <img
            src={selectedImage}
            alt="Customer photo enlarged"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 'var(--radius-lg)',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </div>
  );
};
