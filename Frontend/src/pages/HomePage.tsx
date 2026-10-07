import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { HomeHeader } from '../components/home/HomeHeader';
import { LocationBar } from '../components/home/LocationBar';
import { SearchFilterBar } from '../components/home/SearchFilterBar';
import { HeroSlider } from '../components/home/HeroSlider';
import { TrustBadgeStrip } from '../components/home/TrustBadgeStrip';
import { CategoryFilterBar } from '../components/home/CategoryFilterBar';
import { FlashSaleSection } from '../components/home/FlashSaleSection';
import { ProductCatalogSection } from '../components/home/ProductCatalogSection';
import { BottomNavBar } from '../components/home/BottomNavBar';
import {
  HERO_SLIDES,
  TRUST_BADGES,
  QUICK_CATEGORIES,
  FLASH_SALE_PRODUCTS,
  MAIN_CATALOG_PRODUCTS,
  type QuickCategory,
  type ProductCatalogItem,
} from '../services/mockHomeData';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('cat-all');
  const [categories, setCategories] = useState<QuickCategory[]>(QUICK_CATEGORIES);
  const [catalogProducts, setCatalogProducts] = useState<ProductCatalogItem[]>(MAIN_CATALOG_PRODUCTS);
  const [loading, setLoading] = useState(false);

  // 1. Tải danh mục sản phẩm từ backend (hoặc fallback)
  useEffect(() => {
    let isMounted = true;
    categoryService.getCategories().then((data) => {
      if (isMounted && data.length > 0) {
        setCategories(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải sản phẩm theo danh mục và tìm kiếm từ backend (hoặc fallback)
  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      setLoading(true);
      productService
        .getProducts({
          search: searchQuery,
        })
        .then((res) => {
          if (isMounted) {
            // Lọc theo categoryId nếu đã chọn danh mục cụ thể
            if (activeCategoryId !== 'cat-all') {
              const selectedCat = categories.find((c) => c.id === activeCategoryId);
              if (selectedCat) {
                const filtered = res.items.filter(
                  (item) =>
                    item.category.toLowerCase().includes(selectedCat.slug.toLowerCase()) ||
                    item.category.toLowerCase().includes(selectedCat.name.toLowerCase())
                );
                setCatalogProducts(filtered.length > 0 ? filtered : res.items);
              } else {
                setCatalogProducts(res.items);
              }
            } else {
              setCatalogProducts(res.items);
            }
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }, 200); // 200ms debounce cho tìm kiếm

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, activeCategoryId, categories]);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleOpenSearch = () => {
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface-bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: '80px', // Khoảng trống cho Bottom Navigation Bar trên mobile
      }}
    >
      {/* 1. Sticky Top Header */}
      <HomeHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSearch={handleOpenSearch}
      />

      {/* Main Body */}
      <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 2. Location & Context Bar */}
        <LocationBar />

        {/* 3. Search & Filter Bar */}
        <SearchFilterBar
          value={searchQuery}
          onChange={setSearchQuery}
          onFilterClick={() => alert('Bộ lọc nâng cao (Khoảng giá, Đánh giá, Thương hiệu) đang mở!')}
        />

        {/* 4. Editorial Hero Banner Slider */}
        <HeroSlider
          slides={HERO_SLIDES}
          onCtaClick={(slide) => alert(`Khám phá chiến dịch: ${slide.title}`)}
        />

        {/* 5. Trust Value Strip */}
        <TrustBadgeStrip badges={TRUST_BADGES} />

        {/* 6. Category Quick Filter Bar */}
        <CategoryFilterBar
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={(id) => setActiveCategoryId(id)}
        />

        {/* 7. Flash Sale Section */}
        <FlashSaleSection
          products={FLASH_SALE_PRODUCTS}
          onProductClick={(p) => navigate(`/product/${p.id}`)}
          onViewAll={() => alert('Chuyển đến trang tổng hợp Flash Sale')}
        />

        {/* 8. Main Product Catalog Section ("Gợi ý hôm nay") */}
        {loading ? (
          <div
            style={{
              padding: '48px 16px',
              textAlign: 'center',
              color: 'var(--color-on-surface-variant)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div className="btn-spinner" style={{ width: '28px', height: '28px', borderTopColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Đang tải danh sách sản phẩm...</span>
          </div>
        ) : (
          <ProductCatalogSection
            initialProducts={catalogProducts}
            onProductClick={(p) => navigate(`/product/${p.id}`)}
          />
        )}
      </main>

      {/* 9. Bottom Navigation Bar */}
      <BottomNavBar cartCount={0} />
    </div>
  );
};
