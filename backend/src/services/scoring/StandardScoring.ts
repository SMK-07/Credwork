import { ScoringStrategy } from './ScoringStrategy';

// Phase 6  StandardScoring: applies raw delta values without any modifier
// Used when no reason string is provided by the employer

export class StandardScoring extends ScoringStrategy {
  public computeDelta(outcomeKey: string, _reason?: string): number {
    const delta = this.baseDeltas[outcomeKey];
    if (delta === undefined) {
      throw new Error(`Unknown outcome key for scoring: ${outcomeKey}`);
    }
    return delta;
  }
}
