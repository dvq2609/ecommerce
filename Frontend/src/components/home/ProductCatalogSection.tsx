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
  const [displayCount, setDisplayCount] = useState(6);
  const [extraLoaded, setExtraLoaded] = useState(false);

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
    setExtraLoaded(true);
    setDisplayCount((prev) => prev + 6);
  };

  const sortedList = getSortedProducts();
  const currentProducts = sortedList.slice(0, displayCount);

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '16px 16px 32px 16px',
      }}
    >
      {/* Section Header & Filter Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
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
            auto_awesome
          </span>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.3px',
            }}
          >
            Gợi ý hôm nay
          </h3>
        </div>

        {/* Tab Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--color-surface-container-low)',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('popular')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeTab === 'popular' ? 'var(--color-surface-card)' : 'transparent',
              color: activeTab === 'popular' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              fontSize: '12.5px',
              fontWeight: activeTab === 'popular' ? 700 : 500,
              boxShadow: activeTab === 'popular' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Phổ biến
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('latest')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeTab === 'latest' ? 'var(--color-surface-card)' : 'transparent',
              color: activeTab === 'latest' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              fontSize: '12.5px',
              fontWeight: activeTab === 'latest' ? 700 : 500,
              boxShadow: activeTab === 'latest' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Mới nhất
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('best_seller')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeTab === 'best_seller' ? 'var(--color-surface-card)' : 'transparent',
              color: activeTab === 'best_seller' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              fontSize: '12.5px',
              fontWeight: activeTab === 'best_seller' ? 700 : 500,
              boxShadow: activeTab === 'best_seller' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Bán chạy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('price')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeTab === 'price' ? 'var(--color-surface-card)' : 'transparent',
              color: activeTab === 'price' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              fontSize: '12.5px',
              fontWeight: activeTab === 'price' ? 700 : 500,
              boxShadow: activeTab === 'price' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Giá tốt
          </button>
        </div>
      </div>

      {/* Responsive Product Grid: 2 cols on mobile, 3-4 cols on desktop */}
      {currentProducts.length === 0 ? (
        <div
          style={{
            padding: '48px 16px',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-outline)' }}>
            inventory_2
          </span>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
            Chưa có sản phẩm nào trong danh mục này.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
            Dữ liệu được tải trực tiếp từ hệ thống Backend SQL Server.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
            gap: '12px',
          }}
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

      {/* Load More Button (Chỉ hiển thị khi có nhiều hơn số lượng hiện tại) */}
      {sortedList.length > displayCount && (
        <div
          style={{
            marginTop: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            onClick={handleLoadMore}
            style={{
              height: '44px',
              padding: '0 24px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface-card)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-on-surface)',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-card)')}
          >
            <span>{extraLoaded ? 'Đã tải thêm sản phẩm' : `Xem thêm (${sortedList.length - displayCount}) sản phẩm`}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              expand_more
            </span>
          </button>

          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-on-surface-variant)',
              marginTop: '8px',
            }}
          >
            Đang hiển thị {Math.min(currentProducts.length, sortedList.length)} trên {sortedList.length} sản phẩm
          </span>
        </div>
      )}
    </div>
  );
};
