const ScoringStrategy = require('./ScoringStrategy');

class ReasoningProtocol extends ScoringStrategy {
  constructor(standardScoring) {
    super();
    this.standardScoring = standardScoring;
  }

  computeDelta(outcomeType, reasonText) {
    const baseDelta = this.standardScoring.computeDelta(outcomeType, reasonText);
    
    if (!reasonText || typeof reasonText !== 'string') {
      return baseDelta;
    }

    const lowerReason = reasonText.toLowerCase();
    const mitigatingKeywords = ["weather", "emergency", "accident", "medical", "family"];
    const exacerbatingKeywords = ["no contact", "no show", "blocked", "unreachable"];

    const isExacerbating = exacerbatingKeywords.some(kw => lowerReason.includes(kw));
    if (isExacerbating) {
      // apply full standard penalty, no reduction
      return baseDelta;
    }

    const isMitigating = mitigatingKeywords.some(kw => lowerReason.includes(kw));
    // If it's a penalty (< 0) and we have mitigating factors, reduce penalty by 50%
    if (isMitigating && baseDelta < 0) {
      // e.g. -8.0 becomes -4.0
      return baseDelta * 0.5;
    }

    return baseDelta;
  }
}

module.exports = ReasoningProtocol;
