import React from 'react';

interface CollectionItem {
  id: string;
  title: string;
  tag: string;
  imageUrl: string;
  categoryFilter: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-1',
    title: 'ÁO BLAZER & SUIT',
    tag: 'MAY ĐO CAO CẤP',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
    categoryFilter: 'blazer',
  },
  {
    id: 'col-2',
    title: 'ÁO THUN AIRISM',
    tag: 'STREETWEAR ĐƠN SẮC',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    categoryFilter: 't-shirt',
  },
  {
    id: 'col-3',
    title: 'QUẦN TÂY & KAKI',
    tag: 'PHONG CÁCH TỐI GIẢN',
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
    categoryFilter: 'pants',
  },
  {
    id: 'col-4',
    title: 'TÚI XÁCH & PHỤ KIỆN',
    tag: 'TINH XẢO MỖI CHI TIẾT',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
    categoryFilter: 'bags',
  },
];

interface CuratedCollectionsProps {
  onSelectCollection?: (cat: string) => void;
}

export const CuratedCollections: React.FC<CuratedCollectionsProps> = ({ onSelectCollection }) => {
  return (
    <section
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        padding: '24px 20px',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <div className="font-kicker" style={{ marginBottom: '4px' }}>
            LOOKBOOK TUYỂN CHỌN
          </div>
          <h2
            className="font-heading-xl"
            style={{
              color: '#111111',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            BỘ SƯU TẬP THEO PHONG CÁCH
          </h2>
        </div>
      </div>

      {/* 4-Column Responsive Grid with 4:5 Aspect Ratio */}
      <div
        className="curated-collections-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '20px',
        }}
      >
        {COLLECTIONS.map((col) => (
          <div
            key={col.id}
            onClick={() => onSelectCollection?.(col.categoryFilter)}
            role="button"
            tabIndex={0}
            className="img-zoom-parent"
            style={{
              position: 'relative',
              aspectRatio: '4 / 5',
              cursor: 'pointer',
              borderRadius: '20px',
              backgroundColor: '#f5f5f7',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelectCollection?.(col.categoryFilter);
            }}
          >
            {/* Background Image with Zoom */}
            <img
              src={col.imageUrl}
              alt={col.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              loading="lazy"
            />

            {/* Dark Vignette Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.75) 100%)',
              }}
            />

            {/* Content at Bottom */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '24px 20px',
                zIndex: 2,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                {col.tag}
              </span>
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '20px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {col.title}
              </h3>

              <div
                style={{
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                }}
              >
                <span>Xem Ngay</span>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 960px) {
          .curated-collections-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
        }
      `}</style>
    </section>
  );
};
