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
              badge: 'Toàn sàn',
            },
            {
              label: 'Cước vận chuyển (Shipping)',
              path: '/admin/shipping',
              icon: 'local_shipping',
              badge: 'Freeship',
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
              badge: 'Chuẩn sàn',
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
        backgroundColor: 'var(--color-surface-bg)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: 'var(--color-on-surface)',
      }}
    >
      {/* SIDEBAR DESKTOP (Có thể thu nhỏ / mở rộng mượt mà) */}
      <aside
        style={{
          width: sidebarCollapsed ? '78px' : '264px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          boxShadow: 'var(--shadow-soft)',
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
            borderBottom: '1px solid var(--color-border-subtle)',
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
                color: 'var(--color-primary)',
                fontSize: '30px',
                fontVariationSettings: "'FILL' 1",
                flexShrink: 0,
              }}
            >
              local_mall
            </span>
            {!sidebarCollapsed && (
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                  color: 'var(--color-on-surface)',
                  whiteSpace: 'nowrap',
                }}
              >
                Shop<span style={{ color: 'var(--color-primary)' }}>Vibe</span>
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
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-fixed)',
                color: 'var(--color-on-primary-fixed)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                width: 'fit-content',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '15px', color: 'var(--color-primary)' }}
              >
                {isAdmin ? 'shield_person' : 'storefront'}
              </span>
              <span>{isAdmin ? 'Quản Trị Sàn' : 'Kênh Người Bán'}</span>
            </div>
          ) : (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-fixed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={isAdmin ? 'Ban Quản Trị Sàn' : 'Kênh Người Bán'}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '16px', color: 'var(--color-primary)' }}
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
                        borderRadius: 'var(--radius-lg)',
                        textDecoration: 'none',
                        fontSize: '13.5px',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface)',
                        backgroundColor: isActive
                          ? 'var(--color-surface-container-low)'
                          : 'transparent',
                        border: isActive
                          ? '1px solid var(--color-primary-fixed-dim)'
                          : '1px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '22px',
                            color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
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
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isActive ? 'var(--color-primary-fixed)' : 'var(--color-surface-container)',
                            color: isActive ? 'var(--color-on-primary-fixed)' : 'var(--color-on-surface-variant)',
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
            borderTop: '1px solid var(--color-border-subtle)',
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
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-container-lowest)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    boxShadow: '0 2px 6px rgba(186, 0, 54, 0.25)',
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
                      color: 'var(--color-on-surface)',
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
                      color: 'var(--color-on-surface-variant)',
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
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface-container-low)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--color-on-surface)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '18px', color: 'var(--color-primary)' }}
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
            backgroundColor: 'rgba(252, 249, 248, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Nút 3 gạch điều khiển Sidebar & Tiêu đề trang (KHÔNG lặp lại logo ShopVibe ở đây nữa) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={toggleSidebar}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-container-low)',
                border: '1px solid var(--color-border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-on-surface)',
                transition: 'all 0.15s ease',
              }}
              title={sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                menu
              </span>
            </button>

            <div>
              <h1 style={{ fontSize: '17.5px', fontWeight: 800, margin: 0, color: 'var(--color-on-surface)' }}>
                {title || (isAdmin ? 'Quản Trị Quy Chuẩn Hệ Thống' : 'Kênh Người Bán ShopVibe')}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', margin: '2px 0 0' }}>
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
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                color: 'var(--color-on-surface)',
                backgroundColor: 'var(--color-surface-container-low)',
                border: '1px solid var(--color-border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
              icon={
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
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
                borderBottom: '1px solid var(--color-border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: 'var(--color-primary)',
                    fontSize: '28px',
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  local_mall
                </span>
                <span style={{ fontSize: '20px', fontWeight: 800 }}>
                  Shop<span style={{ color: 'var(--color-primary)' }}>Vibe</span>
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
                  color: 'var(--color-on-surface-variant)',
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
                      color: 'var(--color-on-surface-variant)',
                      padding: '0 8px 6px',
                    }}
                  >
                    {group.group}
                  </div>
                  {group.items.map((item, iIdx) => (
                    <Link
                      key={iIdx}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        textDecoration: 'none',
                        fontSize: '13.5px',
                        fontWeight: location.pathname === item.path ? 700 : 500,
                        color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-on-surface)',
                        backgroundColor: location.pathname === item.path ? 'var(--color-surface-container-low)' : 'transparent',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-surface-container)',
                  border: 'none',
                  color: 'var(--color-error)',
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
