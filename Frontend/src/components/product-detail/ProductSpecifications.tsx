import React from 'react';
import type { ProductSpecItem } from '../../types/productDetail';

interface ProductSpecificationsProps {
  sku: string;
  specs: ProductSpecItem[];
  descriptionText: string;
}

export const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  sku,
  specs,
  descriptionText,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        backgroundColor: 'var(--color-surface-card)',
        padding: '20px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: 'var(--color-on-surface)',
            letterSpacing: '-0.01em',
          }}
        >
          Thông tin chi tiết
        </h3>
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-container-high)',
            color: 'var(--color-on-surface-variant)',
          }}
        >
          Mã SP: {sku}
        </span>
      </div>

      {/* 2. Specs List Table */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {specs.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '12px 0',
              borderBottom: idx < specs.length - 1 ? '1px solid var(--color-surface-container)' : 'none',
              gap: '16px',
            }}
          >
            <span
              style={{
                fontSize: '13.5px',
                color: 'var(--color-on-surface-variant)',
                width: '120px',
                flexShrink: 0,
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--color-on-surface)',
                textAlign: 'right',
                flex: 1,
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* 3. Long Editorial Description (Không kèm ảnh theo yêu cầu của user) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingTop: '16px',
          borderTop: '1px dashed var(--color-border-subtle)',
        }}
      >
        <h4
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--color-on-surface)',
          }}
        >
          Mô tả sản phẩm
        </h4>
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.7,
            color: 'var(--color-on-surface-variant)',
            whiteSpace: 'pre-line',
          }}
        >
          {descriptionText}
        </p>
      </div>
    </div>
  );
};
