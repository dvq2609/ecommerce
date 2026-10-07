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
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '10px 16px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          backgroundColor: 'var(--color-surface-container-low)',
          padding: '12px 8px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        {badges.map((badge) => (
          <div
            key={badge.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: 'var(--color-primary)',
                fontSize: '24px',
                fontVariationSettings: "'FILL' 1",
              }}
            >
              {badge.icon}
            </span>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--color-on-surface)',
                marginTop: '4px',
                lineHeight: 1.2,
              }}
            >
              {badge.title}
            </span>
            <span
              style={{
                fontSize: '10.5px',
                color: 'var(--color-on-surface-variant)',
                marginTop: '2px',
                display: 'block',
              }}
            >
              {badge.subtitle}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
