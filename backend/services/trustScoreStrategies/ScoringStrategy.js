class ScoringStrategy {
  computeDelta(outcomeType, reasonText) {
    throw new Error('Method computeDelta() must be implemented by subclasses');
  }
}

module.exports = ScoringStrategy;
