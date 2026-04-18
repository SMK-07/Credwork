import { OutcomeType, ScoreEventType } from '../../types/enums';

// Phase 6 — Abstract Strategy class for trust score computation
// Open for extension (new strategies), closed for modification (OCP principle)

export abstract class ScoringStrategy {
  // Base deltas used by StandardScoring; ReasoningProtocol may modify them
  protected readonly baseDeltas: Record<string, number> = {
    [OutcomeType.CONFIRMED]: 5.0,
    [OutcomeType.REJECTED]: -3.0,
    [OutcomeType.GHOST]: -8.0,
    DISPUTE_WON: 4.0,
    DISPUTE_LOST: -6.0,
  };

  // Maps OutcomeType to ScoreEventType for audit log
  public mapToEventType(outcomeKey: string): ScoreEventType {
    const mapping: Record<string, ScoreEventType> = {
      [OutcomeType.CONFIRMED]: ScoreEventType.WORK_CONFIRMED,
      [OutcomeType.REJECTED]: ScoreEventType.WORK_REJECTED,
      [OutcomeType.GHOST]: ScoreEventType.GHOST,
      DISPUTE_WON: ScoreEventType.DISPUTE_WON,
      DISPUTE_LOST: ScoreEventType.DISPUTE_LOST,
    };
    return mapping[outcomeKey] ?? ScoreEventType.WORK_CONFIRMED;
  }

  public abstract computeDelta(outcomeKey: string, reason?: string): number;
}
