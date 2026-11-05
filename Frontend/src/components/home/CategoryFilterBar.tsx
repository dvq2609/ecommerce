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
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        padding: '12px 20px 4px 20px',
      }}
    >
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          overflowX: 'auto',
          padding: '4px 0',
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
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '9999px',
                backgroundColor: isActive ? '#111111' : '#ffffff',
                color: isActive ? '#ffffff' : '#111111',
                border: isActive ? '1px solid #111111' : '1px solid #e5e5e5',
                fontSize: '13.5px',
                fontWeight: isActive ? 700 : 600,
                flexShrink: 0,
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 12px rgba(17, 17, 17, 0.14)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '18px',
                  color: isActive ? '#ffffff' : '#111111',
                }}
              >
                {cat.icon}
              </span>
              <span>{cat.name}</span>

              {cat.badge && (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? '#d30005' : '#f5f5f7',
                    color: isActive ? '#ffffff' : '#111111',
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
