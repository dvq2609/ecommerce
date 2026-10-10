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
  const [showAllReviewsModal, setShowAllReviewsModal] = useState<boolean>(false);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');

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

            {/* Seller Response Box */}
            {rev.sellerReply && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-surface-container-low)',
                  borderRadius: 'var(--radius-lg)',
                  borderLeft: '3px solid #ff385c',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                    🏪 Phản hồi của Người Bán
                  </span>
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>✓ Chính hãng</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-on-surface)', lineHeight: '1.45' }}>
                  {rev.sellerReply}
                </p>
                {rev.sellerRepliedAt && (
                  <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', display: 'block', marginTop: '4px' }}>
                    {rev.sellerRepliedAt}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Button to see all reviews */}
      <button
        type="button"
        onClick={() => setShowAllReviewsModal(true)}
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
          cursor: 'pointer',
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

      {/* ════════════ MODAL: TOÀN BỘ ĐÁNH GIÁ TỪ KHÁCH HÀNG ════════════ */}
      {showAllReviewsModal && (
        <div
          onClick={() => setShowAllReviewsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '85vh',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                  Đánh Giá Từ Khách Hàng
                </h3>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  {ratingCount} đánh giá • Điểm trung bình {rating} / 5.0 ★
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllReviewsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                }}
              >
                ✕
              </button>
            </div>

            {/* Filter Tags */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #f3f4f6',
                flexWrap: 'wrap',
              }}
            >
              {(['all', 5, 4, 3, 2, 1] as const).map((filter) => {
                const isActive = starFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStarFilter(filter)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isActive ? '1px solid #ef4444' : '1px solid #e5e7eb',
                      backgroundColor: isActive ? '#fef2f2' : '#ffffff',
                      color: isActive ? '#dc2626' : '#4b5563',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {filter === 'all' ? 'Tất cả' : `${filter} Sao`}
                  </button>
                );
              })}
            </div>

            {/* Modal Reviews List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {reviews
                .filter((r) => (starFilter === 'all' ? true : r.rating === starFilter))
                .map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #f3f4f6',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            fontWeight: 700,
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1f2937' }}>
                            {rev.userName}
                          </div>
                          {rev.variantInfo && (
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Phân loại: {rev.variantInfo}</div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontSize: '14px' }}>
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>

                    <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#374151', lineHeight: '1.5' }}>
                      {rev.comment}
                    </p>

                    {rev.userPhotos && rev.userPhotos.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        {rev.userPhotos.map((photo, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setSelectedImage(photo)}
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid #e5e7eb',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            <img
                              src={photo}
                              alt="Ảnh phản hồi"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    <div style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '2px' }}>{rev.timeAgo}</div>

                    {/* Seller Response in Modal */}
                    {rev.sellerReply && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '10px 14px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          borderLeft: '3px solid #ff385c',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                            🏪 Phản hồi của Người Bán
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 600 }}>✓ Chính hãng</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                          {rev.sellerReply}
                        </p>
                        {rev.sellerRepliedAt && (
                          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '3px' }}>
                            {rev.sellerRepliedAt}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

              {reviews.filter((r) => (starFilter === 'all' ? true : r.rating === starFilter)).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: '14px' }}>
                  Không có đánh giá nào {starFilter !== 'all' ? `cho mức ${starFilter} sao` : ''}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
