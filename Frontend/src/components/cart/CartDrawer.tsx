import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    itemCount,
    totalAmount,
    loading,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Khóa scroll body khi Drawer mở
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Đóng bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const freeShippingThreshold = 1000000;
  const isFreeShipping = totalAmount >= freeShippingThreshold;
  const shippingProgress = Math.min(100, Math.round((totalAmount / freeShippingThreshold) * 100));

  if (!isDrawerOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Đóng giỏ hàng"
        onClick={closeDrawer}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') closeDrawer();
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          transition: 'opacity 200ms ease',
        }}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          animation: 'slideInRight 220ms ease-out forwards',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #ebebeb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '24px', color: '#ff385c' }}
            >
              shopping_bag
            </span>
            <h2
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#222222',
                margin: 0,
              }}
            >
              Giỏ hàng ({itemCount})
            </h2>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Đóng"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6a6a6a',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              close
            </span>
          </button>
        </div>

        {/* Free Shipping Progress Strip */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: isFreeShipping ? '#e6f7f5' : '#fff5f7',
            borderBottom: '1px solid #ebebeb',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: isFreeShipping ? '#007a70' : '#c13515',
            }}
          >
            {isFreeShipping ? (
              <span>🎉 Bạn đã được Miễn phí vận chuyển toàn quốc!</span>
            ) : (
              <span>
                Mua thêm {formatPrice(freeShippingThreshold - totalAmount)} để được <b>Freeship</b>
              </span>
            )}
            <span>{shippingProgress}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: isFreeShipping ? '#b2e8e3' : '#ffd1da',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${shippingProgress}%`,
                height: '100%',
                backgroundColor: isFreeShipping ? '#00a699' : '#ff385c',
                borderRadius: '9999px',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>

        {/* Items List (Scrollable) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
          }}
        >
          {loading && (!cart || cart.items.length === 0) ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '240px',
                gap: '12px',
                color: '#6a6a6a',
              }}
            >
              <div
                className="btn-spinner"
                style={{ width: '28px', height: '28px', borderTopColor: '#ff385c' }}
              />
              <span style={{ fontSize: '13px' }}>Đang cập nhật giỏ hàng...</span>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '320px',
                textAlign: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#f7f7f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6a6a6a',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
                  shopping_cart
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#222222' }}>
                Giỏ hàng của bạn đang trống
              </h3>
              <p style={{ fontSize: '13px', color: '#6a6a6a', margin: 0, maxWidth: '260px' }}>
                Khám phá các sản phẩm thời trang cao cấp từ ShopVibe và thêm vào giỏ nhé!
              </p>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  navigate('/');
                }}
                style={{
                  marginTop: '8px',
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  backgroundColor: '#222222',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Khám phá ngay
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.items.map((item) => (
                <div
                  key={item.cartItemId}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #ebebeb',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      closeDrawer();
                      navigate(`/product/${item.productSlug || item.productId}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        closeDrawer();
                        navigate(`/product/${item.productSlug || item.productId}`);
                      }
                    }}
                    style={{
                      width: '80px',
                      height: '88px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#f7f7f7',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={
                        item.productImage ||
                        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&auto=format&fit=crop&q=80'
                      }
                      alt={item.productName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>

                  {/* Info & Quantity controls */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <h4
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          closeDrawer();
                          navigate(`/product/${item.productSlug || item.productId}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            closeDrawer();
                            navigate(`/product/${item.productSlug || item.productId}`);
                          }
                        }}
                        style={{
                          margin: 0,
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: '#222222',
                          cursor: 'pointer',
                          lineHeight: '1.35',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.productName}
                      </h4>

                      <button
                        type="button"
                        onClick={() => removeItem(item.cartItemId)}
                        aria-label="Xóa món hàng"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          color: '#6a6a6a',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#c13515')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6a6a')}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          delete
                        </span>
                      </button>
                    </div>

                    {/* Variant badge */}
                    {(item.colorName || item.sizeName) && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '4px',
                        }}
                      >
                        {item.hexCode && (
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: item.hexCode,
                              border: '1px solid rgba(0,0,0,0.15)',
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#6a6a6a',
                          }}
                        >
                          {item.colorName}
                          {item.colorName && item.sizeName ? ' • ' : ''}
                          {item.sizeName ? `Size ${item.sizeName}` : ''}
                        </span>
                      </div>
                    )}

                    {/* Price and Stepper */}
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#222222',
                        }}
                      >
                        {formatPrice(item.unitPrice)}
                      </span>

                      {/* Stepper buttons */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #dddddd',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          style={{
                            width: '26px',
                            height: '26px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: item.quantity <= 1 ? '#cccccc' : '#222222',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            remove
                          </span>
                        </button>

                        <span
                          style={{
                            width: '28px',
                            textAlign: 'center',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#222222',
                          }}
                        >
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={item.quantity >= item.stockQuantity}
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          style={{
                            width: '26px',
                            height: '26px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor:
                              item.quantity >= item.stockQuantity ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color:
                              item.quantity >= item.stockQuantity ? '#cccccc' : '#222222',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            add
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart && cart.items.length > 0 && (
          <div
            style={{
              padding: '18px 20px',
              borderTop: '1px solid #ebebeb',
              backgroundColor: '#ffffff',
              boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontSize: '14px', color: '#6a6a6a' }}>Tạm tính:</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#222222' }}>
                {formatPrice(totalAmount)}
              </span>
            </div>
            <p
              style={{
                fontSize: '11.5px',
                color: '#6a6a6a',
                margin: '0 0 14px',
              }}
            >
              Thuế và phí vận chuyển sẽ được tính khi đặt hàng.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  navigate('/cart');
                }}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '9999px',
                  backgroundColor: '#ff385c',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(255, 56, 92, 0.25)',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e00b41')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff385c')}
              >
                <span>Xem giỏ hàng & Đặt hàng</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
