import React from 'react';
import { TRUST_BADGES, type TrustBadge } from '../../services/mockHomeData';

interface TrustBadgeStripProps {
  badges?: TrustBadge[];
}

export const TrustBadgeStrip: React.FC<TrustBadgeStripProps> = ({
  badges = TRUST_BADGES,
}) => {
  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        padding: '8px 20px 16px 20px',
      }}
    >
      <div
        className="card-hairline"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderRadius: '20px',
        }}
      >
        {badges.map((badge) => (
          <div
            key={badge.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '6px 8px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#f5f5f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  color: '#111111',
                  fontSize: '22px',
                }}
              >
                {badge.icon}
              </span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#111111',
                  lineHeight: 1.25,
                }}
              >
                {badge.title}
              </div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: '#707072',
                  marginTop: '2px',
                }}
              >
                {badge.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
