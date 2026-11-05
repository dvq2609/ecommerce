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
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        padding: '4px 20px 12px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Search Input Box */}
        <div
          style={{
            flex: 1,
            height: '48px',
            backgroundColor: '#ffffff',
            borderRadius: '9999px',
            padding: '0 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            border: '1px solid #e5e5e5',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '21px', color: '#111111' }}
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
              color: '#111111',
              fontFamily: 'inherit',
              fontWeight: 500,
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              style={{
                color: '#707072',
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
              color: '#707072',
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
            borderRadius: '9999px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e5',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#111111',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '21px' }}>
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
              backgroundColor: '#111111',
              color: '#ffffff',
              fontSize: '9px',
              fontWeight: 800,
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
