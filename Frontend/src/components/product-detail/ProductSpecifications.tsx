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
        gap: '24px',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '28px',
        borderRadius: '20px',
        border: '1px solid var(--nike-hairline, #e5e5e5)',
      }}
    >
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--nike-black, #111111)',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          Thông tin chi tiết
        </h3>
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
            color: 'var(--nike-gray, #707072)',
            border: '1px solid var(--nike-hairline, #e5e5e5)',
          }}
        >
          Mã SKU: {sku}
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
