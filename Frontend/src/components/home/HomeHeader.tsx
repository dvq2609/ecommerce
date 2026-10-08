import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        backgroundColor: 'rgba(252, 249, 248, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-soft)',
      }}
      className="pt-safe"
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          height: '64px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Logo & Brand */}
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
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--color-on-surface)',
            }}
          >
            Shop<span style={{ color: 'var(--color-primary)' }}>Vibe</span>
          </span>
        </Link>

        {/* Quick Search Button (Mobile/Tablet pill) */}
        <div
          onClick={onOpenSearch}
          role="button"
          tabIndex={0}
          style={{
            flex: 1,
            maxWidth: '360px',
            height: '42px',
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-full)',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            border: '1px solid var(--color-border-subtle)',
            transition: 'all 0.2s ease',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onOpenSearch?.();
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: 'var(--color-primary)' }}
          >
            search
          </span>
          <span
            style={{
              fontSize: '13px',
              color: 'var(--color-on-surface-variant)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Tìm kiếm trang phục, túi xách, phụ kiện...
          </span>
        </div>

        {/* Right Actions: Notification & User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Notification Bell */}
          <button
            type="button"
            aria-label="Thông báo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              color: 'var(--color-on-surface)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.2s',
            }}
            onClick={() => alert('Chưa có thông báo mới!')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              notifications
            </span>
            <span
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
              }}
            />
          </button>

          {/* User Profile / Login Button */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px 4px 4px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-surface-container)',
                  cursor: 'pointer',
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
                    fontSize: '14px',
                  }}
                >
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-on-surface)',
                    maxWidth: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentUser.fullName?.split(' ').pop() || 'User'}
                </span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)' }}
                >
                  expand_more
                </span>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '180px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '8px 0',
                    zIndex: 60,
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 16px',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>
                      {currentUser.fullName}
                    </div>
                    <div
                      style={{
                        color: 'var(--color-on-surface-variant)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {currentUser.email}
                    </div>
                    {currentUser.role && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          backgroundColor: '#f7f7f7',
                          color: '#222222',
                          border: '1px solid #dddddd',
                        }}
                      >
                        {(currentUser.role || '').toLowerCase() === 'admin' ? '👑 Admin' : '🏪 Người bán'}
                      </span>
                    )}
                  </div>

                  {/* ADMIN LINKS (Admin only: System standard size guide) */}
                  {(currentUser.role || '').toLowerCase() === 'admin' && (
                    <div style={{ padding: '4px 0', borderBottom: '1px solid #ebebeb' }}>
                      <Link
                        to="/admin/sizes"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#222222',
                          textDecoration: 'none',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ff385c' }}>
                          straighten
                        </span>
                        <span>Quản lý Kích Cỡ (Size Guide)</span>
                      </Link>
                    </div>
                  )}

                  {/* SELLER LINKS (Seller only: Products & Colors) */}
                  {(currentUser.role || '').toLowerCase() === 'seller' && (
                    <div style={{ padding: '4px 0', borderBottom: '1px solid #ebebeb' }}>
                      <Link
                        to="/seller/products/new"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#222222',
                          textDecoration: 'none',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ff385c' }}>
                          add_box
                        </span>
                        <span>Đăng bán sản phẩm</span>
                      </Link>
                      <Link
                        to="/seller/colors"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#222222',
                          textDecoration: 'none',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ff385c' }}>
                          palette
                        </span>
                        <span>Quản lý Bảng Màu</span>
                      </Link>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: 'var(--color-on-surface)',
                      textAlign: 'left',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      person
                    </span>
                    Tài khoản của tôi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: 'var(--color-error)',
                      textAlign: 'left',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      logout
                    </span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '38px',
                padding: '0 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(186, 0, 54, 0.25)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                login
              </span>
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
