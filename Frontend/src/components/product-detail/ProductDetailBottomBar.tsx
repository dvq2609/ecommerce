import React from 'react';

interface ProductDetailBottomBarProps {
  onChat?: () => void;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  isSellerOwner?: boolean;
}

export const ProductDetailBottomBar: React.FC<ProductDetailBottomBarProps> = ({
  onChat,
  onAddToCart,
  onBuyNow,
  isSellerOwner = false,
}) => {
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--nike-hairline, #e5e5e5)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
      }}
      className="pb-safe"
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          height: '68px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Left icon buttons: Chat & Quick Add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isSellerOwner && (
            <button
              type="button"
              aria-label="Chat ngay với người bán"
              onClick={onChat}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '50px',
                height: '46px',
                borderRadius: '8px',
                color: 'var(--nike-gray, #707072)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--nike-black, #111111)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--nike-gray, #707072)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                chat
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>Chat</span>
            </button>
          )}

          <button
            type="button"
            aria-label="Thêm vào giỏ hàng"
            onClick={onAddToCart}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '50px',
              height: '46px',
              borderRadius: '8px',
              color: 'var(--nike-gray, #707072)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--nike-black, #111111)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--nike-gray, #707072)')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              shopping_bag
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>Giỏ</span>
          </button>
        </div>

        {/* Right CTA buttons: Thêm vào giỏ & Mua ngay */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '440px' }}>
          <button
            type="button"
            onClick={onAddToCart}
            className="btn-pill-secondary"
            style={{
              flex: 1,
              height: '46px',
              fontSize: '13.5px',
            }}
          >
            Thêm vào giỏ
          </button>

          <button
            type="button"
            onClick={onBuyNow}
            className="btn-pill-primary"
            style={{
              flex: 1,
              height: '46px',
              fontSize: '13.5px',
            }}
          >
            Mua ngay
          </button>
        </div>
      </div>
    </footer>
  );
};
