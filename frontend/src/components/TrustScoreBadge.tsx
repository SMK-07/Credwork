import React, { Component } from 'react';
import { ScoreTier } from '../types';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Phase 10 — TrustScoreBadge class component
// Computes tier from score and renders colour-coded badge with score + tier label

export class TrustScoreBadge extends Component<Props> {
  private computeTier(score: number): ScoreTier {
    if (score <= 30) return ScoreTier.UNVERIFIED;
    if (score <= 50) return ScoreTier.NEW;
    if (score <= 70) return ScoreTier.RELIABLE;
    if (score <= 85) return ScoreTier.TRUSTED;
    return ScoreTier.ELITE;
  }

  private getTierClass(tier: ScoreTier): string {
    const map: Record<ScoreTier, string> = {
      [ScoreTier.UNVERIFIED]: 'trust-badge-unverified',
      [ScoreTier.NEW]: 'trust-badge-new',
      [ScoreTier.RELIABLE]: 'trust-badge-reliable',
      [ScoreTier.TRUSTED]: 'trust-badge-trusted',
      [ScoreTier.ELITE]: 'trust-badge-elite',
    };
    return map[tier];
  }

  private getTierIcon(tier: ScoreTier): string {
    const map: Record<ScoreTier, string> = {
      [ScoreTier.UNVERIFIED]: '⚠️',
      [ScoreTier.NEW]: '🌱',
      [ScoreTier.RELIABLE]: '⭐',
      [ScoreTier.TRUSTED]: '✅',
      [ScoreTier.ELITE]: '🏆',
    };
    return map[tier];
  }

  public render(): React.ReactNode {
    const { score, size = 'md', showLabel = true } = this.props;
    const tier = this.computeTier(score);
    const tierClass = this.getTierClass(tier);
    const tierIcon = this.getTierIcon(tier);
    const isLg = size === 'lg';
    const isSm = size === 'sm';

    return (
      <span
        className={`trust-badge ${tierClass} ${isLg ? 'trust-badge-lg' : ''}`}
        title={`Trust Score: ${score}/100 — ${tier}`}
        style={{ fontSize: isSm ? '0.7rem' : undefined }}
      >
        <span>{tierIcon}</span>
        {isLg ? (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
            {score.toFixed(1)}
          </span>
        ) : (
          <span>{score.toFixed(1)}</span>
        )}
        {showLabel && <span>{tier}</span>}
      </span>
    );
  }
}
