const StandardScoring = require('./trustScoreStrategies/StandardScoring');
const ReasoningProtocol = require('./trustScoreStrategies/ReasoningProtocol');

// Define strategies
const standardStrategy = new StandardScoring();
const reasoningStrategy = new ReasoningProtocol(standardStrategy);

class TrustScore {
  constructor(currentScore) {
    this.currentScore = currentScore;
  }

  computeReason(outcomeType, reasonText) {
    // Select strategy at runtime based on whether a reason string is present (and outcome isn't purely standard without reason)
    const strategy = reasonText ? reasoningStrategy : standardStrategy;
    return strategy.computeDelta(outcomeType, reasonText);
  }

  applyDelta(delta, reasonText) {
    let newScore = this.currentScore + delta;
    
    // Clamp between 0.0 and 100.0
    if (newScore > 100.0) newScore = 100.0;
    if (newScore < 0.0) newScore = 0.0;
    
    return {
      newScore,
      delta,
      reason: reasonText || 'Standard update'
    };
  }
}

module.exports = TrustScore;
