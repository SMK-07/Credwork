const { Worker, User, Application, ScoreEvent, Verification } = require('../models');

class WorkerRepository {
  async createWorker(workerData) {
    return await Worker.create(workerData);
  }

  async findWorkerById(workerId) {
    return await Worker.findByPk(workerId, {
      include: [
        { model: User, attributes: ['phone', 'role', 'created_at'] }
      ]
    });
  }

  async findWorkerByUserId(userId) {
    return await Worker.findOne({ where: { user_id: userId } });
  }

  async findWorkerProfile(workerId) {
    return await Worker.findByPk(workerId, {
      include: [
        { model: User, attributes: ['phone'] },
        { model: Application, include: [{ model: ScoreEvent }] }
      ]
    });
  }

  async updateTrustScore(workerId, newScore, transaction = null) {
    return await Worker.update(
      { trust_score: newScore },
      { where: { id: workerId }, transaction }
    );
  }
}

module.exports = new WorkerRepository();
