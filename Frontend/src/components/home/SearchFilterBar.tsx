import React from 'react';

interface SearchFilterBarProps {
  value: string;
  onChange: (val: string) => void;
  onFilterClick?: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  value,
  onChange,
  onFilterClick,
}) => {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '4px 16px 12px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Search Input Box */}
        <div
          style={{
            flex: 1,
            height: '48px',
            backgroundColor: 'var(--color-surface-card)',
            borderRadius: 'var(--radius-full)',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '22px', color: 'var(--color-primary)' }}
          >
            search
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tìm kiếm trang phục, túi xách, phụ kiện..."
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--color-on-surface)',
              fontFamily: 'inherit',
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              style={{
                color: 'var(--color-on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                close
              </span>
            </button>
          )}
          <button
            type="button"
            aria-label="Tìm kiếm bằng hình ảnh"
            onClick={() => alert('Tính năng tìm kiếm bằng hình ảnh sắp ra mắt!')}
            style={{
              color: 'var(--color-on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '4px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              photo_camera
            </span>
          </button>
        </div>

        {/* Filter Tune Button */}
        <button
          type="button"
          onClick={onFilterClick}
          aria-label="Bộ lọc"
          style={{
            position: 'relative',
            width: '48px',
            height: '48px',
            flexShrink: 0,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-card)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-on-surface)',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            tune
          </span>
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontSize: '9px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            2
          </span>
        </button>
      </div>
    </div>
  );
};
