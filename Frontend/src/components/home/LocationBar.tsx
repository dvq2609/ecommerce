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
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        padding: '12px 20px 8px 20px',
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
            color: '#111111',
            fontVariationSettings: "'FILL' 1",
          }}
        >
          location_on
        </span>
        <span
          style={{
            fontSize: '13px',
            color: '#707072',
            fontWeight: 500,
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
            fontWeight: 700,
            color: '#111111',
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
            style={{ fontSize: '16px', color: '#707072' }}
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
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          padding: '5px 12px',
          borderRadius: '9999px',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#007d48',
            boxShadow: '0 0 6px rgba(0, 125, 72, 0.5)',
          }}
        />
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#111111',
            whiteSpace: 'nowrap',
          }}
        >
          Giao siêu tốc 2h
        </span>
      </div>
    </div>
  );
};
