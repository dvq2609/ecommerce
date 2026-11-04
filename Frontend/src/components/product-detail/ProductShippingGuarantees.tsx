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
          padding: '14px 16px',
          borderRadius: '14px',
          backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
          border: '1px solid var(--nike-hairline, #e5e5e5)',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            color: 'var(--nike-black, #111111)',
            border: '1px solid var(--nike-hairline, #e5e5e5)',
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
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--nike-black, #111111)' }}>
              Giao hàng dự kiến
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                color: 'var(--nike-black, #111111)',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
              }}
            >
              Hỏa tốc
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--nike-gray, #707072)', margin: '2px 0 0 0' }}>
            Nhận hàng vào <strong style={{ color: 'var(--nike-black, #111111)' }}>{shippingEstimate.deliveryDateText}</strong>
          </p>

          <p style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, margin: '2px 0 0 0' }}>
            {shippingEstimate.freeShippingThresholdText}
          </p>
        </div>
      </div>

      {/* 2 Guarantees Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
        }}
      >
        {guarantees.map((g, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--nike-hairline, #e5e5e5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '20px', color: 'var(--nike-black, #111111)', flexShrink: 0 }}
            >
              {g.icon}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--nike-black, #111111)' }}>
                {g.title}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--nike-gray, #707072)' }}>
                {g.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
