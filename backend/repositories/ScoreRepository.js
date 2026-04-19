const { ScoreEvent, Worker } = require('../models');

class ScoreRepository {
  async createScoreEvent(eventData, transaction = null) {
    return await ScoreEvent.create(eventData, { transaction });
  }

  async getScoreHistoryForWorker(workerId) {
    return await ScoreEvent.findAll({
      where: { worker_id: workerId },
      order: [['created_at', 'DESC']]
    });
  }
}

module.exports = new ScoreRepository();
