import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavProps {
  cartCount?: number;
}

export const BottomNavBar: React.FC<BottomNavProps> = ({ cartCount = 0 }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: 'home' },
    { path: '/explore', label: 'Khám phá', icon: 'explore' },
    { path: '/wishlist', label: 'Yêu thích', icon: 'favorite' },
    { path: '/cart', label: 'Giỏ hàng', icon: 'shopping_bag', badge: cartCount },
    { path: '/profile', label: 'Tài khoản', icon: 'account_circle' },
  ];

  return (
    <nav
      className="pb-safe"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(252, 249, 248, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-bottom-nav)',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px',
        }}
      >
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '56px',
                height: '48px',
                color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 500,
                transition: 'color 0.15s ease',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '24px',
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  marginTop: '2px',
                  letterSpacing: '0.01em',
                }}
              >
                {item.label}
              </span>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '12px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
