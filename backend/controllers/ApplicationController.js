const { Application, Worker } = require('../models');

class ApplicationController {
  async applyForJob(req, res, next) {
    try {
      const { job_id } = req.body;
      const worker = await Worker.findOne({ where: { user_id: req.user.id } });
      if (!worker) return res.status(403).json({ error: 'Worker profile required' });

      const app = await Application.create({ worker_id: worker.id, job_id, status: 'PENDING' });
      res.status(201).json(app);
    } catch (e) {
      next(e);
    }
  }

  async getApplication(req, res, next) {
    try {
      const { id } = req.params;
      const app = await Application.findByPk(id);
      if (!app) return res.status(404).json({ error: 'Application not found' });
      res.json(app);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ApplicationController();
