import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import type { ProductCatalogItem } from '../../types/home';

interface ProductCatalogSectionProps {
  initialProducts?: ProductCatalogItem[];
  onProductClick?: (product: ProductCatalogItem) => void;
}

type SortTab = 'popular' | 'latest' | 'best_seller' | 'price';

export const ProductCatalogSection: React.FC<ProductCatalogSectionProps> = ({
  initialProducts = [],
  onProductClick,
}) => {
  const [activeTab, setActiveTab] = useState<SortTab>('popular');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [displayCount, setDisplayCount] = useState(8);

  const toggleLike = (id: string) => {
    setLikedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Sắp xếp sản phẩm theo tab
  const getSortedProducts = () => {
    const list = [...initialProducts];
    if (activeTab === 'price') {
      list.sort((a, b) => a.price - b.price);
    } else if (activeTab === 'best_seller') {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (activeTab === 'latest') {
      list.reverse();
    }
    return list;
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 8);
  };

  const sortedList = getSortedProducts();
  const currentProducts = sortedList.slice(0, displayCount);
  const desktopCols = currentProducts.length === 3 ? 3 : currentProducts.length >= 4 ? 4 : 3;

  return (
    <div
      id="catalog-section"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        padding: '16px 20px 48px 20px',
      }}
    >
      {/* Section Header & Minimalist Pill Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div className="font-kicker" style={{ marginBottom: '8px' }}>
            DANH MỤC THỜI TRANG CHÍNH HÃNG
          </div>
          <h2
            className="font-heading-xl"
            style={{
              color: '#111111',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Sản Phẩm Mới & Thịnh Hành
          </h2>
        </div>

        {/* Nike Full-Pill Tab Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f5f5f7',
            padding: '4px',
            borderRadius: '9999px',
            border: '1px solid #e5e5e5',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('popular')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'popular' ? '#111111' : 'transparent',
              color: activeTab === 'popular' ? '#ffffff' : '#39393b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Phổ biến
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('latest')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'latest' ? '#111111' : 'transparent',
              color: activeTab === 'latest' ? '#ffffff' : '#39393b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Mới nhất
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('best_seller')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'best_seller' ? '#111111' : 'transparent',
              color: activeTab === 'best_seller' ? '#ffffff' : '#39393b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Bán chạy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('price')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'price' ? '#111111' : 'transparent',
              color: activeTab === 'price' ? '#ffffff' : '#39393b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Giá tốt
          </button>
        </div>
      </div>

      {/* Responsive Nike 8px Grid: 4 cols on desktop, 3 on tablet, 2 on mobile */}
      {currentProducts.length === 0 ? (
        <div
          style={{
            padding: '64px 20px',
            textAlign: 'center',
            backgroundColor: '#f5f5f7',
            borderRadius: '24px',
            border: '1px dashed #e5e5e5',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#9e9ea0' }}>
            inventory_2
          </span>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#111111', marginTop: '12px' }}>
            Chưa có sản phẩm nào trong danh mục này.
          </p>
          <p style={{ fontSize: '13px', color: '#707072' }}>
            Dữ liệu được cập nhật tự động từ hệ thống Backend.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${desktopCols}, minmax(0, 1fr))`,
            gap: '20px',
          }}
          className="catalog-grid-responsive"
        >
          {currentProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isLiked={!!likedMap[product.id]}
              onToggleLike={toggleLike}
              onClick={onProductClick}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {sortedList.length > displayCount && (
        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            onClick={handleLoadMore}
            className="btn-pill-secondary"
            style={{
              padding: '14px 32px',
              fontSize: '14.5px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span>Xem Thêm Sản Phẩm ({sortedList.length - displayCount})</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              expand_more
            </span>
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .catalog-grid-responsive {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};
