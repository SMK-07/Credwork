import React from 'react';

const getTierInfo = (score) => {
  if (score <= 30) return { label: 'Unverified', color: 'var(--score-unverified)' };
  if (score <= 50) return { label: 'New', color: 'var(--score-new)' };
  if (score <= 70) return { label: 'Reliable', color: 'var(--score-reliable)' };
  if (score <= 85) return { label: 'Trusted', color: 'var(--score-trusted)' };
  return { label: 'Elite', color: 'var(--score-elite)' };
};

const TrustScoreBadge = ({ score }) => {
  const validScore = Math.max(0, Math.min(100, score || 50));
  const { label, color } = getTierInfo(validScore);

  return (
    <div className="trust-badge" style={{ backgroundColor: color + '33', color: color, border: `1px solid ${color}` }}>
      {validScore.toFixed(1)} - {label}
    </div>
  );
};

export default TrustScoreBadge;
