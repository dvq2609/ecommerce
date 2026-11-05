import React, { useEffect, useState } from 'react';
import { voucherService } from '../../services/voucherService';
import type { VoucherItem } from '../../types/voucher';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

export const VoucherStripSection: React.FC = () => {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);

  useEffect(() => {
    let mounted = true;
    voucherService.getPublicVouchers().then((list) => {
      if (mounted && list.length > 0) {
        setVouchers(list.filter((v) => v.discountType !== 2));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (vouchers.length === 0) return null;

  return (
    <section
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        padding: '16px 20px',
      }}
    >
      {/* Header */}
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <div className="font-kicker" style={{ marginBottom: '4px' }}>
            ĐẶC QUYỀN SHOPVIBE
          </div>
          <h2
            className="font-heading-xl"
            style={{
              color: '#111111',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            MÃ GIẢM GIÁ ĐỘC QUYỀN
          </h2>
        </div>
      </div>

      {/* Equal-Width Responsive Grid aligned with TrustBadgeStrip & CuratedCollections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {vouchers.map((v) => (
          <div
            key={v.voucherId}
            style={{
              display: 'flex',
              backgroundColor: '#ffffff',
              border: '1px solid var(--nike-hairline, #e5e5e5)',
              borderRadius: '14px',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Left Ticket Stub */}
            <div
              style={{
                width: '92px',
                backgroundColor: 'var(--nike-black, #111111)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 8px',
                textAlign: 'center',
                borderRight: '2px dashed rgba(255,255,255,0.35)',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '18px', marginBottom: '2px' }}>🏷️</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  opacity: 0.9,
                }}
              >
                VOUCHER
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  marginTop: '3px',
                  letterSpacing: '-0.02em',
                }}
              >
                {v.discountType === 0
                  ? `-${v.discountValue}%`
                  : `-${Math.round(v.discountValue / 1000)}K`}
              </span>
            </div>

            {/* Right Ticket Content */}
            <div
              style={{
                flex: 1,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px',
                minWidth: 0,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
                      color: 'var(--nike-black, #111111)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {v.code}
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--nike-gray, #707072)',
                      fontWeight: 600,
                    }}
                  >
                    Đã dùng {v.usagePercentage}%
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: 'var(--nike-black, #111111)',
                    marginTop: '5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {v.title}
                </div>
                <div
                  style={{
                    fontSize: '11.5px',
                    color: 'var(--nike-gray, #707072)',
                    marginTop: '2px',
                  }}
                >
                  Đơn tối thiểu {formatPrice(v.minOrderValue)}
                  {v.maxDiscountAmount ? ` • Tối đa ${formatPrice(v.maxDiscountAmount)}` : ''}
                </div>
              </div>

              {/* Usage bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '9999px',
                    backgroundColor: '#ebebeb',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.max(8, v.usagePercentage)}%`,
                      backgroundColor: 'var(--nike-sale, #d30005)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
