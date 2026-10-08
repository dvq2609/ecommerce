import React from 'react';
import type { QuickCategory } from '../../types/home';

interface CategoryFilterBarProps {
  categories?: QuickCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories = [],
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '6px 0',
      }}
    >
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '4px 16px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isActive
                  ? 'var(--color-primary)'
                  : 'var(--color-surface-container-low)',
                color: isActive ? '#ffffff' : 'var(--color-on-surface)',
                border: isActive
                  ? '1px solid var(--color-primary)'
                  : '1px solid var(--color-border-subtle)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                flexShrink: 0,
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px rgba(186, 0, 54, 0.25)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '17px',
                  color: isActive ? '#ffffff' : 'var(--color-primary)',
                }}
              >
                {cat.icon}
              </span>
              <span>{cat.name}</span>

              {cat.badge && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? '#ffffff' : 'var(--color-primary-fixed)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-on-primary-fixed)',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
