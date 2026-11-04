import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { NotificationBell } from '../notification/NotificationBell';

interface HomeHeaderProps {
  currentUser: { fullName: string; email: string; role?: string } | null;
  onLogout: () => void;
  onOpenSearch?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  currentUser,
  onLogout,
  onOpenSearch,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount, openDrawer } = useCart();

  // Track scroll state for subtle shadow adjustment
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-user-dropdown]')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Mới Nhất', to: '/#new-arrivals', badge: null },
    { label: 'Nam', to: '/#men', badge: null },
    { label: 'Nữ', to: '/#women', badge: null },
    { label: 'Áo Blazer', to: '/#blazer', badge: null },
    { label: 'Flash Sale', to: '/#flash-sale', badge: '-20%' },
  ];

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR (Nike / Apple Utility Banner) */}
      <div
        style={{
          backgroundColor: '#111111',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 500,
          padding: '6px 16px',
          textAlign: 'center',
          letterSpacing: '0.01em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <span>
          Miễn phí giao hàng cho đơn từ <strong>499.000₫</strong> • Đổi trả tận nơi trong 30 ngày
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', display: 'none' }} className="sm-inline">
          |
        </span>
        <Link
          to="/orders"
          style={{
            color: 'rgba(255, 255, 255, 0.85)',
            textDecoration: 'underline',
            fontSize: '11.5px',
            display: 'none',
          }}
          className="sm-inline"
        >
          Theo dõi đơn hàng
        </Link>
      </div>

      {/* 2. MAIN STICKY NAVIGATION (Apple Frosted Glass + Nike Minimalist Chrome) */}
      <header
        className="glass-navbar pt-safe"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          transition: 'box-shadow 0.25s ease',
          boxShadow: isScrolled
            ? '0 4px 20px rgba(0, 0, 0, 0.06)'
            : '0 1px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            height: '66px',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Left: Mobile Toggle + Logo + Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                color: '#111111',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              className="mobile-menu-btn"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                menu
              </span>
            </button>

            {/* Brand Logo */}
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '20px',
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  local_mall
                </span>
              </div>
              <span
                style={{
                  fontSize: '21px',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: '#111111',
                  textTransform: 'uppercase',
                }}
              >
                Shop<span style={{ color: '#707072', fontWeight: 600 }}>Vibe</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
              className="desktop-nav-links"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#39393b',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 4px',
                    position: 'relative',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#111111')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#39393b')}
                >
                  {link.label}
                  {link.badge && (
                    <span className="tag-pill-sale" style={{ fontSize: '10px', padding: '1px 6px' }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center/Right: Quick Search Pill */}
          <div
            onClick={onOpenSearch}
            role="button"
            tabIndex={0}
            style={{
              flex: 1,
              maxWidth: '380px',
              height: '42px',
              backgroundColor: '#f5f5f7',
              borderRadius: '9999px',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              border: '1px solid transparent',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ebebee';
              e.currentTarget.style.borderColor = '#e5e5e5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f7';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenSearch?.();
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '19px', color: '#707072' }}
            >
              search
            </span>
            <span
              style={{
                fontSize: '13.5px',
                color: '#707072',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Tìm kiếm trang phục, phụ kiện...
            </span>
          </div>

          {/* Right Action Icons: Notification, Cart, User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Notification Bell */}
            <NotificationBell
              buttonStyle={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                color: '#111111',
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              icon={
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  notifications
                </span>
              }
            />

            {/* Cart Button with Nike Sale Badge */}
            <button
              type="button"
              aria-label="Giỏ hàng"
              onClick={openDrawer}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                color: '#111111',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              title="Giỏ hàng"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '23px' }}>
                shopping_bag
              </span>
              {itemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '9999px',
                    backgroundColor: '#d30005',
                    color: '#ffffff',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 5px rgba(211, 0, 5, 0.4)',
                    border: '1.5px solid #ffffff',
                  }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Login */}
            {currentUser ? (
              <div style={{ position: 'relative' }} data-user-dropdown>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 10px 4px 4px',
                    borderRadius: '9999px',
                    backgroundColor: '#f5f5f7',
                    border: '1px solid #e5e5e5',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#111111',
                      maxWidth: '85px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentUser.fullName?.split(' ').pop() || 'User'}
                  </span>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: '#707072' }}
                  >
                    expand_more
                  </span>
                </button>

                {/* Apple-style User Dropdown Menu */}
                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: 0,
                      width: '240px',
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
                      padding: '8px',
                      zIndex: 60,
                      border: '1px solid #e5e5e5',
                      animation: 'fadeIn 0.15s ease',
                    }}
                  >
                    {/* Header info */}
                    <div
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid #f0f0f2',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#111111', fontSize: '13.5px' }}>
                        {currentUser.fullName}
                      </div>
                      <div
                        style={{
                          color: '#707072',
                          fontSize: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: '2px',
                        }}
                      >
                        {currentUser.email}
                      </div>
                      {currentUser.role && (
                        <span
                          className="tag-pill-neutral"
                          style={{
                            marginTop: '6px',
                            fontSize: '10.5px',
                            padding: '2px 8px',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {(currentUser.role || '').toLowerCase() === 'admin'
                            ? '👑 Quản Trị Viên'
                            : (currentUser.role || '').toLowerCase() === 'seller'
                            ? '🏪 Người Bán Hàng'
                            : '🛍️ Khách Hàng'}
                        </span>
                      )}
                    </div>

                    {/* SELLER SHORTCUTS */}
                    {(currentUser.role || '').toLowerCase() === 'seller' && (
                      <div style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f2' }}>
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#111111',
                            borderRadius: '8px',
                            textDecoration: 'none',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#111111' }}>
                            dashboard
                          </span>
                          <span>Bảng điều khiển (Dashboard)</span>
                        </Link>
                        <Link
                          to="/seller/inventory"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#111111',
                            borderRadius: '8px',
                            textDecoration: 'none',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#111111' }}>
                            inventory_2
                          </span>
                          <span>Quản lý kho hàng</span>
                        </Link>
                        <Link
                          to="/seller/messages"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#111111',
                            borderRadius: '8px',
                            textDecoration: 'none',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#111111' }}>
                            chat
                          </span>
                          <span>Tin nhắn khách hàng</span>
                        </Link>
                        <Link
                          to="/seller/products/new"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#39393b',
                            borderRadius: '8px',
                            textDecoration: 'none',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#707072' }}>
                            add_box
                          </span>
                          <span>Đăng sản phẩm mới</span>
                        </Link>
                      </div>
                    )}

                    {/* ADMIN SHORTCUTS */}
                    {(currentUser.role || '').toLowerCase() === 'admin' && (
                      <div style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f2' }}>
                        <Link
                          to="/admin/orders"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#111111',
                            borderRadius: '8px',
                            textDecoration: 'none',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#111111' }}>
                            receipt_long
                          </span>
                          <span>Quản lý Đơn hàng sàn</span>
                        </Link>
                        <Link
                          to="/admin/shipping"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#39393b',
                            borderRadius: '8px',
                            textDecoration: 'none',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#707072' }}>
                            local_shipping
                          </span>
                          <span>Cước vận chuyển</span>
                        </Link>
                      </div>
                    )}

                    {/* COMMON LINKS */}
                    <div style={{ padding: '4px 0' }}>
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: '#39393b',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#707072' }}>
                          package_2
                        </span>
                        <span>Đơn mua của tôi</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: '#39393b',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#707072' }}>
                          person
                        </span>
                        <span>Tài khoản của tôi</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: '#d30005',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          textAlign: 'left',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#d30005' }}>
                          logout
                        </span>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-pill-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  login
                </span>
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 3. MOBILE SLIDE-IN NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
          }}
        >
          {/* Backdrop blur */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Drawer content */}
          <div
            style={{
              position: 'relative',
              width: '85%',
              maxWidth: '340px',
              height: '100%',
              backgroundColor: '#ffffff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 20px',
              zIndex: 10,
              overflowY: 'auto',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.04em' }}>
                SHOP<span style={{ color: '#707072' }}>VIBE</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f7',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            </div>

            {/* Navigation list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111111',
                    textDecoration: 'none',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{link.label}</span>
                  {link.badge ? (
                    <span className="tag-pill-sale">{link.badge}</span>
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9e9ea0' }}>
                      chevron_right
                    </span>
                  )}
                </Link>
              ))}

              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#39393b',
                  textDecoration: 'none',
                  padding: '12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  receipt_long
                </span>
                <span>Đơn mua của tôi</span>
              </Link>
            </div>

            {/* Drawer Footer Actions */}
            <div style={{ paddingTop: '20px', borderTop: '1px solid #f0f0f2' }}>
              {currentUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '13px', color: '#707072' }}>
                    Đang đăng nhập: <strong>{currentUser.fullName}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="btn-pill-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-pill-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Đăng nhập / Đăng ký
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS for responsive header rules */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav-links {
            display: none !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @media (min-width: 640px) {
          .sm-inline {
            display: inline !important;
          }
        }
      `}</style>
    </>
  );
};
