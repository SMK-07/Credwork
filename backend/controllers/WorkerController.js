const WorkerRepository = require('../repositories/WorkerRepository');
const ScoreRepository = require('../repositories/ScoreRepository');

class WorkerController {
  async getProfile(req, res, next) {
    try {
      const worker = await WorkerRepository.findWorkerByUserId(req.params.id);
      if (!worker) return res.status(404).json({ error: 'Worker not found' });
      
      const fullProfile = await WorkerRepository.findWorkerProfile(worker.id);
      res.json(fullProfile);
    } catch (e) {
      next(e);
    }
  }

  async getScoreHistory(req, res, next) {
    try {
      const worker = await WorkerRepository.findWorkerByUserId(req.params.id);
      if (!worker) return res.status(404).json({ error: 'Worker not found' });

      const history = await ScoreRepository.getScoreHistoryForWorker(worker.id);
      res.json({ score: worker.trust_score, history });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new WorkerController();
