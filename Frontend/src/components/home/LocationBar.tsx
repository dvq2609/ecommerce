import React, { useState } from 'react';
import { CITIES_LIST } from '../../services/mockHomeData';

export const LocationBar: React.FC = () => {
  const [cityIndex, setCityIndex] = useState(0);

  const handleNextCity = () => {
    setCityIndex((prev) => (prev + 1) % CITIES_LIST.length);
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}
    >
      {/* Location Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: '18px',
            color: 'var(--color-primary)',
            fontVariationSettings: "'FILL' 1",
          }}
        >
          location_on
        </span>
        <span
          style={{
            fontSize: '13px',
            color: 'var(--color-on-surface-variant)',
          }}
        >
          Giao đến:
        </span>
        <button
          type="button"
          onClick={handleNextCity}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-on-surface)',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            padding: 0,
          }}
          title="Bấm để đổi khu vực giao hàng"
        >
          <span>{CITIES_LIST[cityIndex]}</span>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)' }}
          >
            expand_more
          </span>
        </button>
      </div>

      {/* Express Delivery Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--color-surface-container)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
          }}
        />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-on-surface)',
            whiteSpace: 'nowrap',
          }}
        >
          Giao siêu tốc 2h
        </span>
      </div>
    </div>
  );
};
