import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import type { ProductDetailData, ProductVariantColor, ProductVariantSize, RecommendedProduct } from '../types/productDetail';
import { ProductDetailHeader } from '../components/product-detail/ProductDetailHeader';
import { ProductImageGallery } from '../components/product-detail/ProductImageGallery';
import { ProductInfoSection } from '../components/product-detail/ProductInfoSection';
import { ProductVariantSelector } from '../components/product-detail/ProductVariantSelector';
import { ProductShippingGuarantees } from '../components/product-detail/ProductShippingGuarantees';
import { ProductSpecifications } from '../components/product-detail/ProductSpecifications';
import { ProductReviewsSection } from '../components/product-detail/ProductReviewsSection';
import { ProductRecommendations } from '../components/product-detail/ProductRecommendations';
import { ProductDetailBottomBar } from '../components/product-detail/ProductDetailBottomBar';
import { useCart } from '../context/CartContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, openDrawer, itemCount } = useCart();

  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variant selections
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Cart & UI Feedback
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);

  // Load product detail data from Backend API
  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'instant' });

    const timer = setTimeout(() => {
      const targetId = id || 'ao-blazer-form-rong-ve-k-co-dien';
      productService
        .getProductDetail(targetId)
        .then((data) => {
          if (isMounted) {
            setProduct(data);
            const firstColorId = data.colors[0]?.id || '';
            setSelectedColorId(firstColorId);

            // Tìm size đầu tiên còn hàng ứng với màu sắc này
            const initialSize = data.sizes.find((s) => {
              if (data.variants && data.variants.length > 0) {
                const v = data.variants.find(
                  (item) => item.colorId.toString() === firstColorId && item.sizeId.toString() === s.id
                );
                return v && v.stockQuantity > 0 && v.isActive;
              }
              return s.inStock;
            }) || data.sizes.find((s) => s.inStock) || data.sizes[0];

            setSelectedSizeId(initialSize?.id || '');
            setQuantity(1);
            setActiveImageIndex(0);
            setLoading(false);

            // Tự động scroll xuống đánh giá nếu url có hash #reviews
            if (window.location.hash === '#reviews') {
              setTimeout(() => {
                const reviewsSection = document.getElementById('reviews');
                if (reviewsSection) {
                  reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 200);
            }
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [id]);

  // 1. Tính toán trạng thái tồn kho của từng size tương ứng với màu đang được chọn
  const activeSizes: ProductVariantSize[] = useMemo(() => {
    if (!product) return [];
    if (!product.variants || product.variants.length === 0) return product.sizes;
    return product.sizes.map((s) => {
      const v = product.variants?.find(
        (variant) => variant.colorId.toString() === selectedColorId && variant.sizeId.toString() === s.id
      );
      return {
        ...s,
        inStock: v ? v.stockQuantity > 0 && v.isActive : s.inStock,
      };
    });
  }, [product, selectedColorId]);

  // 2. Biến thể cụ thể đang được chọn (Color x Size)
  const activeVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    return product.variants.find(
      (v) => v.colorId.toString() === selectedColorId && v.sizeId.toString() === selectedSizeId
    );
  }, [product, selectedColorId, selectedSizeId]);

  const currentStock = activeVariant ? activeVariant.stockQuantity : (product?.stockQuantity ?? 0);
  const isOutOfStock = currentStock <= 0;
  const currentPrice = activeVariant && activeVariant.price > 0 ? activeVariant.price : (product?.price ?? 0);

  const handleColorChange = (color: ProductVariantColor) => {
    setSelectedColorId(color.id);
    if (color.imageIndex !== undefined && color.imageIndex !== null && product && color.imageIndex < product.images.length) {
      setActiveImageIndex(color.imageIndex);
    }

    // Tự động chuyển sang size còn hàng nếu size hiện tại bị hết hàng ở màu vừa chọn
    if (product?.variants && product.variants.length > 0) {
      const currentVar = product.variants.find(
        (v) => v.colorId.toString() === color.id && v.sizeId.toString() === selectedSizeId
      );
      if (!currentVar || currentVar.stockQuantity <= 0) {
        const firstAvailable = product.sizes.find((s) => {
          const v = product.variants?.find(
            (item) => item.colorId.toString() === color.id && item.sizeId.toString() === s.id
          );
          return v && v.stockQuantity > 0 && v.isActive;
        });
        if (firstAvailable) {
          setSelectedSizeId(firstAvailable.id);
        }
      }
    }
  };

  const handleSizeChange = (size: ProductVariantSize) => {
    setSelectedSizeId(size.id);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (isOutOfStock) {
      alert('Biến thể này hiện đã hết hàng, vui lòng chọn màu sắc hoặc kích cỡ khác!');
      return;
    }

    const prodId = Number(product.id) || 2;
    const variantId = activeVariant?.variantId ? Number(activeVariant.variantId) : null;

    const res = await addToCart(prodId, variantId, quantity);

    if (!res.success) {
      if (res.message?.includes('đăng nhập')) {
        if (window.confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Chuyển đến trang Đăng nhập ngay?')) {
          navigate('/login');
        }
      } else {
        alert(res.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
      }
      return;
    }

    const chosenColor = product.colors.find((c) => c.id === selectedColorId)?.name || 'Mặc định';
    const chosenSize = product.sizes.find((s) => s.id === selectedSizeId)?.name || 'M';
    const skuText = activeVariant?.sku ? ` (SKU: ${activeVariant.sku})` : '';

    setCartSuccessMessage(
      `Đã thêm ${quantity}x "${product.title}" (${chosenColor} • Size ${chosenSize})${skuText} vào giỏ hàng!`
    );

    setTimeout(() => {
      setCartSuccessMessage(null);
    }, 3500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      alert('Biến thể này hiện đã hết hàng, vui lòng chọn màu sắc hoặc kích cỡ khác!');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      if (window.confirm('Vui lòng đăng nhập để tiến hành mua hàng. Chuyển đến trang Đăng nhập ngay?')) {
        navigate('/login?redirect=/checkout');
      }
      return;
    }

    const prodId = Number(product?.id) || 2;
    const variantId = activeVariant?.variantId ? Number(activeVariant.variantId) : null;
    const chosenColor = product?.colors.find((c) => c.id === selectedColorId)?.name || '';
    const chosenSize = product?.sizes.find((s) => s.id === selectedSizeId)?.name || '';

    navigate('/checkout', {
      state: {
        buyNowItem: {
          productId: prodId,
          productVariantId: variantId,
          quantity: quantity,
          title: product?.title || 'Sản phẩm ShopVibe',
          price: currentPrice,
          imageUrl: (product?.images && (product.images[activeImageIndex] || product.images[0])) || '',
          colorName: chosenColor,
          sizeName: chosenSize,
        },
      },
    });
  };

  const handleChat = () => {
    alert('Đang kết nối trung tâm tư vấn viên ShopVibe...');
  };

  const handleSelectRecommended = (item: RecommendedProduct) => {
    navigate(`/product/${item.id}`);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <div
          className="btn-spinner"
          style={{ width: '36px', height: '36px', borderTopColor: 'var(--color-primary)' }}
        />
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
          Đang tải chi tiết sản phẩm từ hệ thống...
        </span>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '56px', color: 'var(--color-outline)' }}
        >
          inventory_2
        </span>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-on-surface)' }}>
          Không tìm thấy sản phẩm
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', maxWidth: '420px', lineHeight: 1.5 }}>
          Sản phẩm bạn đang tìm kiếm không tồn tại trong cơ sở dữ liệu hoặc đường dẫn đã thay đổi.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            marginTop: '8px',
            padding: '12px 28px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface-bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: '88px', // Space for bottom bar
      }}
    >
      {/* 1. Header */}
      <ProductDetailHeader
        title={product.title}
        cartCount={itemCount}
        onOpenCart={openDrawer}
      />

      {/* Main Product Container */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '16px 16px 32px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Top Showcase: 2-column on desktop, single column on mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '32px',
            alignItems: 'start',
            backgroundColor: 'var(--color-surface-card)',
            padding: '24px',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Left Column: Image Gallery (Proportionally matches the page!) */}
          <div style={{ width: '100%' }}>
            <ProductImageGallery
              images={product.images}
              title={product.title}
              isLiked={isLiked}
              onToggleLike={() => setIsLiked(!isLiked)}
              activeIndex={activeImageIndex}
              onSelectIndex={setActiveImageIndex}
            />
          </div>

          {/* Right Column: Information, Pricing, Variants & Guarantees */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
            <ProductInfoSection product={product} displayPrice={currentPrice} />

            <ProductVariantSelector
              colors={product.colors}
              sizes={activeSizes}
              stockQuantity={currentStock}
              selectedColorId={selectedColorId}
              selectedSizeId={selectedSizeId}
              quantity={quantity}
              onSelectColor={handleColorChange}
              onSelectSize={handleSizeChange}
              onChangeQuantity={setQuantity}
            />

            <ProductShippingGuarantees
              shippingEstimate={product.shippingEstimate}
              guarantees={product.guarantees}
            />

            {/* Desktop Quick Action Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '10px',
              }}
            >
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  border: isOutOfStock ? '1.5px solid var(--color-outline)' : '1.5px solid var(--color-primary)',
                  backgroundColor: 'transparent',
                  color: isOutOfStock ? 'var(--color-outline)' : 'var(--color-primary)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isOutOfStock) e.currentTarget.style.backgroundColor = 'var(--color-primary-fixed)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {isOutOfStock ? 'production_quantity_limits' : 'add_shopping_cart'}
                </span>
                {isOutOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: isOutOfStock ? 'var(--color-surface-container-high)' : 'var(--color-primary)',
                  color: isOutOfStock ? 'var(--color-on-surface-variant)' : '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isOutOfStock ? 'none' : '0 4px 14px rgba(186, 0, 54, 0.3)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isOutOfStock) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOutOfStock) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Specifications & Description (Without lookbook photos!) */}
        <ProductSpecifications
          sku={product.sku}
          specs={product.specs}
          descriptionText={product.descriptionText}
        />

        {/* 3. Customer Reviews */}
        <div id="reviews">
          <ProductReviewsSection
            rating={product.rating}
            ratingCount={product.ratingCount}
            distribution={product.reviewsDistribution}
            reviews={product.reviews}
          />
        </div>

        {/* 4. Recommendations / "Gợi ý phối đồ" */}
        <ProductRecommendations
          items={product.recommendations}
          onSelectProduct={handleSelectRecommended}
        />
      </main>

      {/* 5. Sticky Bottom Action Bar */}
      <ProductDetailBottomBar
        onChat={handleChat}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Toast Confirmation when adding to cart */}
      {cartSuccessMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            backgroundColor: 'var(--color-on-surface)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-lg)',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '92vw',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#4ade80' }}>
            check_circle
          </span>
          <span style={{ lineHeight: 1.4 }}>{cartSuccessMessage}</span>
        </div>
      )}
    </div>
  );
};
