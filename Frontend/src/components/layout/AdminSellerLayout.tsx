import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { NotificationBell } from '../notification/NotificationBell';

interface AdminSellerLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AdminSellerLayout: React.FC<AdminSellerLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userRole = (currentUser?.role || 'seller').toLowerCase();
  const isAdmin = userRole === 'admin';

  // State điều khiển đóng/mở Sidebar (thu gọn desktop & drawer mobile)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Định nghĩa menu điều hướng chuẩn:
  interface NavItem {
    label: string;
    path: string;
    icon: string;
    badge?: string;
  }

  interface NavGroup {
    group: string;
    items: NavItem[];
  }

  // Phân quyền menu:
  // - Admin: Quản lý Đơn hàng, Cước vận chuyển, Bảng kích cỡ
  // - Seller: Quản lý Đơn hàng, Đánh giá của khách, Đăng bán sản phẩm, Bảng màu sắc
  const navItems: NavGroup[] = isAdmin
    ? [
      {
        group: 'Đơn hàng & Giao vận',
        items: [
          {
            label: 'Quản lý Đơn hàng',
            path: '/admin/orders',
            icon: 'receipt_long',

          },
          {
            label: 'Cước vận chuyển (Shipping)',
            path: '/admin/shipping',
            icon: 'local_shipping',

          },
        ],
      },
      {
        group: 'Quy chuẩn hệ thống',
        items: [
          {
            label: 'Bảng kích cỡ (Size Guide)',
            path: '/admin/sizes',
            icon: 'straighten',

          },
        ],
      },
    ]
    : [
      {
        group: 'Đơn hàng & Giao vận',
        items: [
          {
            label: 'Báo cáo doanh thu',
            path: '/seller/analytics',
            icon: 'query_stats',
          },
          {
            label: 'Quản lý Đơn hàng',
            path: '/admin/orders',
            icon: 'receipt_long',
          },
          {
            label: 'Đánh giá của khách',
            path: '/seller/reviews',
            icon: 'reviews',
          },
          {
            label: 'Tin nhắn khách hàng',
            path: '/seller/messages',
            icon: 'chat',
          },
        ],
      },
      {
        group: 'Kinh doanh sản phẩm',
        items: [
          {
            label: 'Quản lý kho hàng',
            path: '/seller/inventory',
            icon: 'inventory_2',
          },
          {
            label: 'Đăng bán sản phẩm mới',
            path: '/seller/products/new',
            icon: 'add_box',
          },
        ],
      },
      {
        group: 'Thuộc tính thiết kế',
        items: [
          {
            label: 'Bảng màu sắc (Color)',
            path: '/seller/colors',
            icon: 'palette',
          },
        ],
      },
    ];

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: 'var(--nike-black, #111111)',
      }}
    >
      {/* SIDEBAR DESKTOP (Có thể thu nhỏ / mở rộng mượt mà) */}
      <aside
        style={{
          width: sidebarCollapsed ? '78px' : '264px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--nike-hairline, #e5e5e5)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
        className="hidden md:flex"
      >
        {/* Brand Header */}
        <div
          style={{
            padding: sidebarCollapsed ? '20px 14px' : '20px 20px',
            borderBottom: '1px solid var(--nike-hairline, #e5e5e5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: sidebarCollapsed ? 'center' : 'flex-start',
            transition: 'all 0.2s ease',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: 'inherit',
            }}
            title="ShopVibe - Về Trang Chủ"
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: 'var(--nike-black, #111111)',
                fontSize: '28px',
                fontVariationSettings: "'FILL' 1",
                flexShrink: 0,
              }}
            >
              local_mall
            </span>
            {!sidebarCollapsed && (
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  color: 'var(--nike-black, #111111)',
                  whiteSpace: 'nowrap',
                }}
              >
                SHOP<span style={{ color: 'var(--nike-sale, #d30005)' }}>VIBE</span>
              </span>
            )}
          </Link>

          {/* Badge phân loại Portal */}
          {!sidebarCollapsed ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
                color: 'var(--nike-black, #111111)',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                width: 'fit-content',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '14px', color: 'var(--nike-black, #111111)' }}
              >
                {isAdmin ? 'shield_person' : 'storefront'}
              </span>
              <span>{isAdmin ? 'Quản Trị Sàn' : 'Kênh Người Bán'}</span>
            </div>
          ) : (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={isAdmin ? 'Ban Quản Trị Sàn' : 'Kênh Người Bán'}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '16px', color: 'var(--nike-black, #111111)' }}
              >
                {isAdmin ? 'shield_person' : 'storefront'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: sidebarCollapsed ? '16px 8px' : '20px 14px', overflowY: 'auto' }}>
          {navItems.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: '22px' }}>
              {!sidebarCollapsed && (
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-on-surface-variant)',
                    padding: '0 12px 8px',
                    letterSpacing: '0.05em',
                    opacity: 0.8,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {group.group}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {group.items.map((item, iIdx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={iIdx}
                      to={item.path}
                      title={sidebarCollapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                        padding: sidebarCollapsed ? '10px 0' : '10px 14px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '13.5px',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#ffffff' : 'var(--nike-gray, #707072)',
                        backgroundColor: isActive
                          ? 'var(--nike-black, #111111)'
                          : 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--nike-soft-cloud, #f5f5f7)';
                          e.currentTarget.style.color = 'var(--nike-black, #111111)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--nike-gray, #707072)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '20px',
                            color: isActive ? '#ffffff' : 'var(--nike-gray, #707072)',
                            fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </span>
                        {!sidebarCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--nike-soft-cloud, #f5f5f7)',
                            color: isActive ? '#ffffff' : 'var(--nike-black, #111111)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Back to Store Footer */}
        <div
          style={{
            padding: sidebarCollapsed ? '12px 8px' : '16px',
            borderTop: '1px solid var(--nike-hairline, #e5e5e5)',
            backgroundColor: '#ffffff',
          }}
        >
          {!sidebarCollapsed ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                  padding: '8px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
                  border: '1px solid var(--nike-hairline, #e5e5e5)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--nike-black, #111111)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--nike-black, #111111)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentUser?.fullName || 'Người dùng'}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--nike-gray, #707072)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentUser?.email}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to="/"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 12px',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--nike-hairline, #e5e5e5)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--nike-black, #111111)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--nike-soft-cloud, #f5f5f7)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '18px', color: 'var(--nike-black, #111111)' }}
                  >
                    storefront
                  </span>
                  <span>Về Shop</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface-container-low)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-error)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  title="Đăng xuất"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    logout
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <Link
                to="/"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-surface-container-low)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
                title="Về Shop"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  storefront
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-surface-container-low)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-error)',
                  cursor: 'pointer',
                }}
                title="Đăng xuất"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  logout
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--nike-hairline, #e5e5e5)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Nút 3 gạch điều khiển Sidebar & Tiêu đề trang */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={toggleSidebar}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--nike-black, #111111)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--nike-soft-cloud, #f5f5f7)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              title={sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                menu
              </span>
            </button>

            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--nike-black, #111111)', letterSpacing: '-0.01em' }}>
                {title || (isAdmin ? 'Quản Trị Quy Chuẩn Hệ Thống' : 'Kênh Người Bán ShopVibe')}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '12px', color: 'var(--nike-gray, #707072)', margin: '2px 0 0' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Góc phải: Chuông thông báo & User avatar pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Chuông thông báo realtime đồng bộ icon như Homepage */}
            <NotificationBell
              buttonStyle={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                color: 'var(--nike-black, #111111)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                boxShadow: 'none',
                transition: 'all 0.2s ease',
              }}
              icon={
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  notifications
                </span>
              }
            />

            {/* User Pill / Role Pill giống Homepage */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 4px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-container-low)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--color-on-surface)',
                    maxWidth: '110px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentUser?.fullName?.split(' ').pop() || 'User'}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isAdmin ? 'Admin Portal' : 'Seller Store'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1160px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>

      {/* MOBILE DRAWER (Chỉ mở khi màn hình điện thoại < 768px) */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            display: 'flex',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            style={{
              position: 'relative',
              width: '280px',
              backgroundColor: '#ffffff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-card)',
              zIndex: 100,
            }}
          >
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid var(--nike-hairline, #e5e5e5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: 'var(--nike-black, #111111)',
                    fontSize: '26px',
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  local_mall
                </span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--nike-black, #111111)' }}>
                  SHOP<span style={{ color: 'var(--nike-sale, #d30005)' }}>VIBE</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: 'var(--nike-gray, #707072)',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
              {navItems.map((group, gIdx) => (
                <div key={gIdx} style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--nike-gray, #707072)',
                      padding: '0 8px 6px',
                    }}
                  >
                    {group.group}
                  </div>
                  {group.items.map((item, iIdx) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={iIdx}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          fontSize: '13.5px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#ffffff' : 'var(--nike-black, #111111)',
                          backgroundColor: isActive ? 'var(--nike-black, #111111)' : 'transparent',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '20px',
                            color: isActive ? '#ffffff' : 'var(--nike-gray, #707072)',
                          }}
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--nike-hairline, #e5e5e5)' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
                  border: '1px solid var(--nike-hairline, #e5e5e5)',
                  color: 'var(--nike-sale, #d30005)',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  logout
                </span>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
