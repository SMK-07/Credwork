const TrustScore = require('./TrustScore');
const WorkerRepository = require('../repositories/WorkerRepository');
const ScoreRepository = require('../repositories/ScoreRepository');
const { sequelize } = require('../models');
const eventBus = require('./eventBus');

class TrustScoreService {
  constructor() {
    // Observer pattern: listen for outcome events
    eventBus.on('outcome.confirmed', this.handleOutcomeConfirmed.bind(this));
    eventBus.on('dispute.resolved', this.handleDisputeResolved.bind(this));
  }

  async handleOutcomeConfirmed({ applicationId, workerId, outcomeType, reasonText }) {
    await this.processScoreUpdate(workerId, applicationId, outcomeType, reasonText);
  }

  async handleDisputeResolved({ applicationId, workerId, outcomeType, reasonText }) {
    await this.processScoreUpdate(workerId, applicationId, outcomeType, reasonText);
  }

  async processScoreUpdate(workerId, applicationId, outcomeType, reasonText) {
    const transaction = await sequelize.transaction();
    try {
      const worker = await WorkerRepository.findWorkerById(workerId);
      if (!worker) throw new Error('Worker not found');

      const trustScoreDomain = new TrustScore(worker.trust_score);
      const delta = trustScoreDomain.computeReason(outcomeType, reasonText);
      const { newScore, reason } = trustScoreDomain.applyDelta(delta, reasonText);

      // Create ScoreEvent and Update TrustScore atomically
      await ScoreRepository.createScoreEvent({
        worker_id: workerId,
        application_id: applicationId,
        event_type: outcomeType,
        delta: delta,
        reason: reason
      }, transaction);

      await WorkerRepository.updateTrustScore(workerId, newScore, transaction);

      await transaction.commit();
      console.log(`Updated trust score for worker ${workerId}: ${worker.trust_score} -> ${newScore}`);
    } catch (error) {
      await transaction.rollback();
      console.error('Error processing score update:', error);
      throw error;
    }
  }
}

module.exports = new TrustScoreService();
