import React from 'react';

interface ProductDetailBottomBarProps {
  onChat?: () => void;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export const ProductDetailBottomBar: React.FC<ProductDetailBottomBarProps> = ({
  onChat,
  onAddToCart,
  onBuyNow,
}) => {
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(252, 249, 248, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-bottom-nav)',
        borderTop: '1px solid var(--color-border-subtle)',
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
          gap: '10px',
        }}
      >
        {/* Left icon buttons: Chat & Quick Add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            aria-label="Chat ngay với người bán"
            onClick={onChat}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '52px',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-on-surface-variant)',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-on-surface-variant)')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              chat
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>Chat</span>
          </button>

          <button
            type="button"
            aria-label="Thêm vào giỏ hàng"
            onClick={onAddToCart}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '52px',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-on-surface-variant)',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-on-surface-variant)')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              add_shopping_cart
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>Thêm giỏ</span>
          </button>
        </div>

        {/* Right CTA buttons: Thêm vào giỏ & Mua ngay */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '480px' }}>
          <button
            type="button"
            onClick={onAddToCart}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--color-primary)',
              backgroundColor: 'transparent',
              color: 'var(--color-primary)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-fixed)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Thêm vào giỏ
          </button>

          <button
            type="button"
            onClick={onBuyNow}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(186, 0, 54, 0.3)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Mua ngay
          </button>
        </div>
      </div>
    </footer>
  );
};
