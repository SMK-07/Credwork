import { ScoringStrategy } from './ScoringStrategy';

// Phase 6 — ReasoningProtocol: selected when a reason string is present
// Classifies the reason and modifies the delta accordingly

type ReasonClassification = 'mitigating' | 'aggravating' | 'neutral';

export class ReasoningProtocol extends ScoringStrategy {
  private readonly mitigatingKeywords: string[] = [
    'medical',
    'emergency',
    'accident',
    'weather',
    'family',
  ];

  private readonly aggravatingKeywords: string[] = [
    'no show',
    'no contact',
    'blocked',
    'unreachable',
  ];

  public classifyReason(reason: string): ReasonClassification {
    const lowerReason = reason.toLowerCase();

    for (const keyword of this.mitigatingKeywords) {
      if (lowerReason.includes(keyword)) {
        return 'mitigating';
      }
    }

    for (const keyword of this.aggravatingKeywords) {
      if (lowerReason.includes(keyword)) {
        return 'aggravating';
      }
    }

    return 'neutral';
  }

  public computeDelta(outcomeKey: string, reason?: string): number {
    const baseDelta = this.baseDeltas[outcomeKey];
    if (baseDelta === undefined) {
      throw new Error(`Unknown outcome key for scoring: ${outcomeKey}`);
    }

    if (!reason) {
      // No reason provided — apply standard delta
      return baseDelta;
    }

    const classification = this.classifyReason(reason);

    switch (classification) {
      case 'mitigating':
        // Mitigating reason — reduce penalty by 50% (delta × 0.5)
        return baseDelta * 0.5;

      case 'aggravating':
        // Aggravating reason — full penalty (delta × 1.0)
        return baseDelta * 1.0;

      case 'neutral':
      default:
        // Neutral — standard delta, reason is still logged
        return baseDelta * 1.0;
    }
  }
}
