import React from 'react';
import type { ProductDetailData } from '../../types/productDetail';

interface ProductShippingGuaranteesProps {
  shippingEstimate: ProductDetailData['shippingEstimate'];
  guarantees: ProductDetailData['guarantees'];
}

export const ProductShippingGuarantees: React.FC<ProductShippingGuaranteesProps> = ({
  shippingEstimate,
  guarantees,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Shipping Estimate Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '14px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface-container-low)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#d0f8f1',
            color: '#006a62',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            local_shipping
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              Giao hàng dự kiến
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-surface-container-high)',
                color: 'var(--color-on-surface)',
              }}
            >
              Nhanh
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
            Nhận hàng vào <strong style={{ color: 'var(--color-on-surface)' }}>{shippingEstimate.deliveryDateText}</strong>
          </p>

          <p style={{ fontSize: '12px', color: '#006a62', fontWeight: 600, marginTop: '2px' }}>
            {shippingEstimate.freeShippingThresholdText}
          </p>
        </div>
      </div>

      {/* 2 Guarantees Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
        }}
      >
        {guarantees.map((g, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '22px', color: 'var(--color-primary)', flexShrink: 0 }}
            >
              {g.icon}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                {g.title}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                {g.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
