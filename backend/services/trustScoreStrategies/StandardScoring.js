const ScoringStrategy = require('./ScoringStrategy');

class StandardScoring extends ScoringStrategy {
  computeDelta(outcomeType, reasonText) {
    switch (outcomeType) {
      case 'CONFIRMED':
        return 5.0;     // Employer confirms work completed -> +5.0
      case 'REJECTED':
        return -3.0;    // Employer rejects work -> -3.0
      case 'GHOST':
        return -8.0;    // Worker ghosts -> -8.0
      case 'DISPUTE_WON':
        return 4.0;     // Dispute resolved in worker's favour -> +4.0
      case 'DISPUTE_LOST':
        return -6.0;    // Dispute resolved against worker -> -6.0
      default:
        return 0;
    }
  }
}

module.exports = StandardScoring;
