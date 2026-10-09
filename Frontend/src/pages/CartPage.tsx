import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { authService } from '../services/authService';
import { shippingService } from '../services/shippingService';
import { HomeHeader } from '../components/home/HomeHeader';
import { BottomNavBar } from '../components/home/BottomNavBar';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, itemCount, totalAmount, loading, updateQuantity, removeItem, clearCart } =
    useCart();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Dynamic Shipping Config
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(1000000);
  const [defaultShippingFee, setDefaultShippingFee] = useState<number>(30000);
  const [isFreeShippingEnabled, setIsFreeShippingEnabled] = useState<boolean>(true);

  useEffect(() => {
    shippingService.getConfig()
      .then((res) => {
        if (res && res.data) {
          setFreeShippingThreshold(res.data.freeShippingThreshold);
          setDefaultShippingFee(res.data.defaultShippingFee);
          setIsFreeShippingEnabled(res.data.isFreeShippingEnabled);
        }
      })
      .catch((err) => console.error('Lỗi tải cấu hình shipping:', err));
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const isFreeShipping = isFreeShippingEnabled && totalAmount >= freeShippingThreshold;
  const shippingFee = isFreeShipping || totalAmount === 0 ? 0 : defaultShippingFee;
  const discountAmount = voucherApplied ? 50000 : 0;
  const finalTotal = Math.max(0, totalAmount + shippingFee - discountAmount);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã ưu đãi.');
      return;
    }
    if (voucherCode.trim().toUpperCase() === 'SHOPVIBE50') {
      setVoucherApplied(true);
      setVoucherError(null);
    } else {
      setVoucherError('Mã không hợp lệ hoặc đã hết lượt dùng. Thử mã: SHOPVIBE50');
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      if (confirm('Vui lòng đăng nhập để tiến hành thanh toán. Chuyển đến trang Đăng nhập ngay?')) {
        navigate('/login?redirect=/checkout');
      }
      return;
    }
    navigate('/checkout');
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?')) {
      clearCart();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f7f7', // Airbnb soft surface
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        color: '#222222',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Header */}
      <HomeHeader
        currentUser={currentUser}
        onLogout={() => {
          authService.logout();
          setCurrentUser(null);
        }}
      />

      {/* 2. Main Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '24px 16px 80px',
        }}
      >
        {/* Breadcrumb / Title */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#6a6a6a',
              marginBottom: '6px',
            }}
          >
            <Link to="/" style={{ color: '#6a6a6a', textDecoration: 'none' }}>
              Trang chủ
            </Link>
            <span>/</span>
            <span style={{ color: '#222222', fontWeight: 600 }}>Giỏ hàng</span>
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#222222',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>Giỏ hàng của bạn</span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#6a6a6a',
                backgroundColor: '#ffffff',
                border: '1px solid #dddddd',
                padding: '2px 10px',
                borderRadius: '9999px',
              }}
            >
              {itemCount} món
            </span>
          </h1>
        </div>

        {/* Loading state */}
        {loading && (!cart || cart.items.length === 0) ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center',
              border: '1px solid #ebebeb',
            }}
          >
            <div
              className="btn-spinner"
              style={{
                width: '32px',
                height: '32px',
                borderTopColor: '#ff385c',
                margin: '0 auto 16px',
              }}
            />
            <span style={{ fontSize: '14px', color: '#6a6a6a' }}>
              Đang đồng bộ dữ liệu giỏ hàng từ máy chủ...
            </span>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          /* Empty Cart State */
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '64px 24px',
              textAlign: 'center',
              border: '1px solid #ebebeb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                backgroundColor: '#f7f7f7',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6a6a6a',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '44px' }}>
                shopping_bag
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#222222' }}>
              Giỏ hàng của bạn hiện đang trống
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#6a6a6a',
                maxWidth: '400px',
                margin: '0 auto 24px',
                lineHeight: 1.5,
              }}
            >
              Hãy khám phá bộ sưu tập thời trang cao cấp mới nhất từ ShopVibe và thêm sản phẩm yêu thích vào giỏ nhé!
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 32px',
                borderRadius: '9999px',
                backgroundColor: '#ff385c',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(255, 56, 92, 0.25)',
              }}
            >
              <span>Bắt đầu mua sắm ngay</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_forward
              </span>
            </Link>
          </div>
        ) : (
          /* Cart Content Layout */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: '24px',
            }}
            className="lg:grid-cols-[1fr_380px]"
          >
            {/* Left Column: Items List */}
            <div>
              {/* Store Box */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #ebebeb',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                {/* Store Header */}
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #ebebeb',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '20px', color: '#ff385c' }}
                    >
                      storefront
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#222222' }}>
                      ShopVibe Atelier Official
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#e6f7f5',
                        color: '#007a70',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      Chính hãng 100%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c13515',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      delete_sweep
                    </span>
                    <span>Xóa tất cả</span>
                  </button>
                </div>

                {/* Items List */}
                <div style={{ padding: '0 20px' }}>
                  {cart.items.map((item, idx) => (
                    <div
                      key={item.cartItemId}
                      style={{
                        padding: '20px 0',
                        borderBottom:
                          idx === cart.items.length - 1 ? 'none' : '1px solid #ebebeb',
                        display: 'flex',
                        gap: '16px',
                      }}
                    >
                      {/* Image */}
                      <Link
                        to={`/product/${item.productSlug || item.productId}`}
                        style={{
                          width: '96px',
                          height: '108px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#f7f7f7',
                          flexShrink: 0,
                          display: 'block',
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
                      </Link>

                      {/* Content */}
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: '12px',
                            }}
                          >
                            <Link
                              to={`/product/${item.productSlug || item.productId}`}
                              style={{
                                textDecoration: 'none',
                                color: '#222222',
                                fontSize: '15px',
                                fontWeight: 600,
                                lineHeight: 1.4,
                              }}
                            >
                              {item.productName}
                            </Link>

                            <button
                              type="button"
                              onClick={() => removeItem(item.cartItemId)}
                              aria-label="Xóa món"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#6a6a6a',
                                cursor: 'pointer',
                                padding: '4px',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#c13515')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6a6a')}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '20px' }}
                              >
                                delete
                              </span>
                            </button>
                          </div>

                          {/* Variant badge */}
                          {(item.colorName || item.sizeName) && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '6px',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#f7f7f7',
                                border: '1px solid #ebebeb',
                                fontSize: '12px',
                                color: '#6a6a6a',
                              }}
                            >
                              {item.hexCode && (
                                <span
                                  style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: item.hexCode,
                                    border: '1px solid rgba(0,0,0,0.1)',
                                  }}
                                />
                              )}
                              <span>
                                {item.colorName}
                                {item.colorName && item.sizeName ? ' • ' : ''}
                                {item.sizeName ? `Size ${item.sizeName}` : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Price & Stepper row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: '#222222' }}>
                              {formatPrice(item.unitPrice)}
                            </span>
                          </div>

                          {/* Stepper */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid #dddddd',
                              borderRadius: '8px',
                              backgroundColor: '#ffffff',
                              overflow: 'hidden',
                            }}
                          >
                            <button
                              type="button"
                              disabled={item.quantity <= 1}
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: item.quantity <= 1 ? '#cccccc' : '#222222',
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '18px' }}
                              >
                                remove
                              </span>
                            </button>

                            <span
                              style={{
                                width: '36px',
                                textAlign: 'center',
                                fontSize: '13.5px',
                                fontWeight: 700,
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
                                width: '32px',
                                height: '32px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor:
                                  item.quantity >= item.stockQuantity
                                    ? 'not-allowed'
                                    : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color:
                                  item.quantity >= item.stockQuantity ? '#cccccc' : '#222222',
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '18px' }}
                              >
                                add
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping Link */}
              <div style={{ marginTop: '16px' }}>
                <Link
                  to="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#ff385c',
                    textDecoration: 'none',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_back
                  </span>
                  <span>Tiếp tục chọn thêm sản phẩm khác</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary Card (Sticky) */}
            <div>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #ebebeb',
                  padding: '24px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  position: 'sticky',
                  top: '80px',
                }}
              >
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#222222',
                    margin: '0 0 16px',
                  }}
                >
                  Tóm tắt đơn hàng
                </h3>

                {/* Free Shipping Alert */}
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isFreeShipping ? '#e6f7f5' : '#fff5f7',
                    marginBottom: '16px',
                    border: `1px solid ${isFreeShipping ? '#b2e8e3' : '#ffd1da'}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: isFreeShipping ? '#007a70' : '#c13515',
                      marginBottom: '6px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {isFreeShipping ? 'verified' : 'local_shipping'}
                    </span>
                    <span>
                      {isFreeShipping
                        ? 'Đơn hàng đủ điều kiện Freeship!'
                        : `Mua thêm ${formatPrice(freeShippingThreshold - totalAmount)} để nhận Freeship`}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '5px',
                      backgroundColor: '#ffffff',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (totalAmount / freeShippingThreshold) * 100)}%`,
                        height: '100%',
                        backgroundColor: isFreeShipping ? '#00a699' : '#ff385c',
                        borderRadius: '9999px',
                      }}
                    />
                  </div>
                </div>

                {/* Voucher input */}
                <form onSubmit={handleApplyVoucher} style={{ marginBottom: '16px' }}>
                  <label
                    htmlFor="voucher-input"
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#222222',
                      marginBottom: '6px',
                    }}
                  >
                    Mã giảm giá / Voucher
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="voucher-input"
                      type="text"
                      placeholder="Nhập SHOPVIBE50"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      style={{
                        flex: 1,
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #dddddd',
                        fontSize: '13px',
                        outline: 'none',
                        textTransform: 'uppercase',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '0 16px',
                        height: '42px',
                        borderRadius: '8px',
                        backgroundColor: '#222222',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Áp dụng
                    </button>
                  </div>
                  {voucherError && (
                    <div style={{ fontSize: '11.5px', color: '#c13515', marginTop: '4px' }}>
                      {voucherError}
                    </div>
                  )}
                  {voucherApplied && (
                    <div style={{ fontSize: '11.5px', color: '#007a70', marginTop: '4px' }}>
                      ✓ Đã áp dụng mã SHOPVIBE50 (-50.000đ)
                    </div>
                  )}
                </form>

                {/* Price Breakdown */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    paddingTop: '16px',
                    borderTop: '1px solid #ebebeb',
                    fontSize: '13.5px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#6a6a6a',
                    }}
                  >
                    <span>Tạm tính tiền hàng:</span>
                    <span style={{ color: '#222222', fontWeight: 600 }}>
                      {formatPrice(totalAmount)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#6a6a6a',
                    }}
                  >
                    <span>Phí vận chuyển dự kiến:</span>
                    <span style={{ color: isFreeShipping ? '#007a70' : '#222222', fontWeight: 600 }}>
                      {isFreeShipping ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div>

                  {voucherApplied && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: '#007a70',
                      }}
                    >
                      <span>Voucher giảm giá:</span>
                      <span style={{ fontWeight: 600 }}>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div
                    style={{
                      paddingTop: '14px',
                      marginTop: '6px',
                      borderTop: '1px solid #ebebeb',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#222222' }}>
                      Tổng thanh toán:
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#ff385c' }}>
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '9999px',
                    backgroundColor: '#ff385c',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '20px',
                    boxShadow: '0 3px 12px rgba(255, 56, 92, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e00b41')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff385c')}
                >
                  <span>TIẾN HÀNH ĐẶT HÀNG</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    lock
                  </span>
                </button>

                {/* Security badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '16px',
                    fontSize: '11.5px',
                    color: '#6a6a6a',
                  }}
                >

                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Bottom Mobile Bar */}
      <BottomNavBar cartCount={itemCount} />
    </div>
  );
};
export default CartPage;
