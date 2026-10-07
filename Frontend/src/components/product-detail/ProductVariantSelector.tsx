import React, { useState } from 'react';
import type { ProductVariantColor, ProductVariantSize } from '../../types/productDetail';

interface ProductVariantSelectorProps {
  colors: ProductVariantColor[];
  sizes: ProductVariantSize[];
  stockQuantity: number;
  selectedColorId: string;
  selectedSizeId: string;
  quantity: number;
  onSelectColor: (color: ProductVariantColor) => void;
  onSelectSize: (size: ProductVariantSize) => void;
  onChangeQuantity: (qty: number) => void;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  colors,
  sizes,
  stockQuantity,
  selectedColorId,
  selectedSizeId,
  quantity,
  onSelectColor,
  onSelectSize,
  onChangeQuantity,
}) => {
  const [showSizeModal, setShowSizeModal] = useState(false);
  const currentColor = colors.find((c) => c.id === selectedColorId) || colors[0];
  const currentSize = sizes.find((s) => s.id === selectedSizeId) || sizes[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px 0',
        borderTop: '1px solid var(--color-border-subtle)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* 1. Color Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
              Màu sắc:
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {currentColor?.name}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
            {colors.length} màu sắc
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {colors.map((c) => {
            const isSelected = c.id === selectedColorId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectColor(c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--color-surface-card)' : 'var(--color-surface-container-low)',
                  border: isSelected ? '2px solid var(--color-on-surface)' : '1px solid var(--color-border-subtle)',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: '1px solid rgba(0,0,0,0.15)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    color: 'var(--color-on-surface)',
                  }}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Size Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
              Kích thước:
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {currentSize?.name} {currentSize?.description ? `(${currentSize.description})` : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSizeModal(true)}
            style={{
              fontSize: '12px',
              color: 'var(--color-primary)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'underline',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              straighten
            </span>
            Bảng quy đổi cỡ
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {sizes.map((s) => {
            const isSelected = s.id === selectedSizeId;
            return (
              <button
                key={s.id}
                type="button"
                disabled={!s.inStock}
                onClick={() => onSelectSize(s)}
                style={{
                  minWidth: '56px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: !s.inStock
                    ? 'var(--color-surface-container)'
                    : isSelected
                    ? 'var(--color-on-surface)'
                    : 'var(--color-surface-container-low)',
                  color: !s.inStock
                    ? 'var(--color-outline)'
                    : isSelected
                    ? '#ffffff'
                    : 'var(--color-on-surface)',
                  border: isSelected ? '2px solid var(--color-on-surface)' : '1px solid var(--color-border-subtle)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: s.inStock ? 'pointer' : 'not-allowed',
                  opacity: s.inStock ? 1 : 0.5,
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                {s.name}
                {!s.inStock && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      fontSize: '9px',
                      backgroundColor: 'var(--color-surface-container-high)',
                      color: 'var(--color-on-surface-variant)',
                      padding: '1px 4px',
                      borderRadius: '4px',
                    }}
                  >
                    Hết
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Quantity Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
          Số lượng:
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              backgroundColor: 'var(--color-surface-container-low)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: quantity <= 1 ? 'var(--color-outline)' : 'var(--color-on-surface)',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                remove
              </span>
            </button>

            <span
              style={{
                width: '40px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--color-on-surface)',
              }}
            >
              {quantity}
            </span>

            <button
              type="button"
              disabled={quantity >= stockQuantity}
              onClick={() => onChangeQuantity(Math.min(stockQuantity, quantity + 1))}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: quantity >= stockQuantity ? 'var(--color-outline)' : 'var(--color-on-surface)',
                cursor: quantity >= stockQuantity ? 'not-allowed' : 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                add
              </span>
            </button>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
            Còn {stockQuantity} sản phẩm
          </span>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeModal && (
        <div
          onClick={() => setShowSizeModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                Bảng Quy Đổi Kích Cỡ Chuẩn
              </h3>
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            </div>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)', color: 'var(--color-on-surface-variant)' }}>
                  <th style={{ padding: '8px' }}>Size</th>
                  <th style={{ padding: '8px' }}>Cân nặng</th>
                  <th style={{ padding: '8px' }}>Chiều cao</th>
                  <th style={{ padding: '8px' }}>Vòng ngực</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 700 }}>S</td>
                  <td style={{ padding: '10px 8px' }}>45 - 52 kg</td>
                  <td style={{ padding: '10px 8px' }}>1m55 - 1m62</td>
                  <td style={{ padding: '10px 8px' }}>82 - 86 cm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 700 }}>M</td>
                  <td style={{ padding: '10px 8px' }}>53 - 58 kg</td>
                  <td style={{ padding: '10px 8px' }}>1m60 - 1m68</td>
                  <td style={{ padding: '10px 8px' }}>86 - 90 cm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 700 }}>L</td>
                  <td style={{ padding: '10px 8px' }}>59 - 65 kg</td>
                  <td style={{ padding: '10px 8px' }}>1m65 - 1m72</td>
                  <td style={{ padding: '10px 8px' }}>90 - 94 cm</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 8px', fontWeight: 700 }}>XL</td>
                  <td style={{ padding: '10px 8px' }}>66 - 72 kg</td>
                  <td style={{ padding: '10px 8px' }}>1m68 - 1m78</td>
                  <td style={{ padding: '10px 8px' }}>94 - 100 cm</td>
                </tr>
              </tbody>
            </table>

            <p style={{ marginTop: '14px', fontSize: '12px', color: 'var(--color-on-surface-variant)', lineHeight: 1.4 }}>
              * Form áo thiết kế dáng Oversize thời thượng, quý khách thích mặc vừa vặn có thể cân nhắc hạ 1 size.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
