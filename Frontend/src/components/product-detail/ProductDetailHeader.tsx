import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductDetailHeaderProps {
  title?: string;
  cartCount?: number;
  onOpenCart?: () => void;
}

export const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = ({
  title = 'Chi Tiết Sản Phẩm',
  cartCount = 0,
  onOpenCart,
}) => {
  const navigate = useNavigate();
  const [copiedToast, setCopiedToast] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
        return;
      } catch {
        // User canceled or failed, fallback to copy
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {
      alert('Đã chia sẻ link sản phẩm!');
    }
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          width: '100%',
          backgroundColor: 'rgba(252, 249, 248, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            height: '56px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          {/* Back button */}
          <button
            type="button"
            aria-label="Quay lại"
            onClick={() => navigate(-1)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-on-surface)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              arrow_back
            </span>
          </button>

          {/* Centered Page Title */}
          <div style={{ flex: 1, textAlign: 'center', padding: '0 8px', overflow: 'hidden' }}>
            <h1
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--color-on-surface)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h1>
          </div>

          {/* Action buttons (Share & Cart) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              aria-label="Chia sẻ"
              onClick={handleShare}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-on-surface-variant)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-container)';
                e.currentTarget.style.color = 'var(--color-on-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-on-surface-variant)';
              }}
              title="Chia sẻ sản phẩm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                share
              </span>
            </button>

            <button
              type="button"
              aria-label="Giỏ hàng"
              onClick={onOpenCart}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-on-surface-variant)',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-container)';
                e.currentTarget.style.color = 'var(--color-on-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-on-surface-variant)';
              }}
              title="Giỏ hàng"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                shopping_bag
              </span>
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification when link copied */}
      {copiedToast && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            backgroundColor: 'var(--color-on-surface)',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4ade80' }}>
            check_circle
          </span>
          Đã sao chép liên kết sản phẩm!
        </div>
      )}
    </>
  );
};
