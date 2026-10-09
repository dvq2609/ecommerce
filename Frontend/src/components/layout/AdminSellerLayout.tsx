import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  // - Admin: Chỉ quản lý kích cỡ quy chuẩn (Size Guide), không tạo sản phẩm
  // - Seller: Đăng bán sản phẩm và Quản lý bảng màu sắc
  const navItems: NavGroup[] = isAdmin
    ? [
        {
          group: 'Quy chuẩn hệ thống',
          items: [
            {
              label: 'Bảng kích cỡ (Size Guide)',
              path: '/admin/sizes',
              icon: 'straighten',
              badge: 'Chuẩn sàn',
            },
            {
              label: 'Cước vận chuyển (Shipping)',
              path: '/admin/shipping',
              icon: 'local_shipping',
              badge: 'Freeship',
            },
          ],
        },
      ]
    : [
        {
          group: 'Kinh doanh sản phẩm',
          items: [
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

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f7f7f7', // --color-surface-soft
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        color: '#222222', // --color-ink
      }}
    >
      {/* SIDEBAR DESKTOP */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#ffffff', // --color-canvas
          borderRight: '1px solid #ebebeb', // --color-hairline-soft
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
        className="hidden md:flex"
      >
        {/* Brand & Portal Header */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid #ebebeb',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px', // --radius-sm
              backgroundColor: '#ff385c', // --color-primary
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              {isAdmin ? 'shield_person' : 'storefront'}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#222222' }}>
              ShopVibe
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#ff385c',
              }}
            >
              {isAdmin ? '👑 Ban Quản Trị Sàn' : '🏪 Kênh Người Bán'}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
          {navItems.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: '#6a6a6a', // --color-muted
                  padding: '0 12px 8px',
                  letterSpacing: '0.05em',
                }}
              >
                {group.group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item, iIdx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={iIdx}
                      to={item.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#ff385c' : '#3f3f3f', // --color-body
                        backgroundColor: isActive ? '#fff1f3' : 'transparent',
                        border: isActive ? '1px solid #ffd1da' : '1px solid transparent',
                        transition: 'background 150ms ease-out',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '20px',
                            color: isActive ? '#ff385c' : '#6a6a6a',
                          }}
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: '#ebebeb',
                            color: '#222222',
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

        {/* User Card & Back to Store */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #ebebeb',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#f7f7f7',
                border: '1px solid #dddddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#222222',
                fontSize: '14px',
              }}
            >
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#222222',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentUser?.fullName || 'Người dùng'}
              </div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: '#6a6a6a',
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
                gap: '4px',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #dddddd',
                fontSize: '12.5px',
                fontWeight: 500,
                color: '#222222',
                textDecoration: 'none',
                transition: 'background 150ms ease-out',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                storefront
              </span>
              <span>Cửa hàng</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #dddddd',
                color: '#c13515', // --color-error
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 150ms ease-out',
              }}
              title="Đăng xuất"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #ebebeb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                color: '#222222',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                menu
              </span>
            </button>

            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#222222' }}>
                {title || (isAdmin ? 'Quản Trị Quy Chuẩn Hệ Thống' : 'Kênh Người Bán ShopVibe')}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '12px', color: '#6a6a6a', margin: '2px 0 0' }}>{subtitle}</p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                color: '#222222',
                border: '1px solid #dddddd',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#ff385c',
                }}
              />
              {isAdmin ? 'ADMINISTRATOR' : 'SELLER PARTNER'}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1160px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>
    </div>
  );
};
