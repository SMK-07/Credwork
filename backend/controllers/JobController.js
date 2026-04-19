const JobRepository = require('../repositories/JobRepository');
const JobService = require('../services/JobService');
const ApplicationService = require('../services/ApplicationService');
const { Employer, Application } = require('../models');

class JobController {
  async createJob(req, res, next) {
    try {
      const employer = await Employer.findOne({ where: { user_id: req.user.id } });
      if (!employer) return res.status(403).json({ error: 'Employer profile required' });

      const job = await JobService.createJob(employer.id, req.body);
      res.status(201).json(job);
    } catch (e) {
      next(e);
    }
  }

  async listJobs(req, res, next) {
    try {
      const skillsFilter = req.query.skill;
      const jobs = await JobRepository.findAllOpenJobs(skillsFilter);
      res.json(jobs);
    } catch (e) {
      next(e);
    }
  }

  async assignWorker(req, res, next) {
    try {
      const { id } = req.params;
      const job = await JobService.assignWorker(id);
      res.json(job);
    } catch (e) {
      // Return 400 for StateMachine errors
      if (e.message.includes('Invalid job status transition')) {
        return res.status(400).json({ error: e.message });
      }
      next(e);
    }
  }

  async submitOutcome(req, res, next) {
    try {
      // outcome for a job implies outcome for the assigned application.
      // Usually, we should specify Application id.
      // The prompt says: "PATCH /api/jobs/:id/outcome - submit work outcome"
      const { id } = req.params;
      const { outcome, reason, worker_id } = req.body;
      
      const app = await Application.findOne({ where: { job_id: id, worker_id: worker_id, status: 'ACCEPTED' } });
      if (!app) return res.status(404).json({ error: 'Accepted application not found for this job and worker' });

      const updatedApp = await ApplicationService.determineApplicationOutcome(app.id, outcome, reason);
      
      // Update job to COMPLETED if CONFIRMED
      if (outcome === 'CONFIRMED') {
        const job = await JobRepository.findJobById(id);
        job.status = 'COMPLETED';
        await job.save();
      }

      res.json(updatedApp);
    } catch (e) {
      if (e.message.includes('Invalid application status transition')) {
        return res.status(400).json({ error: e.message });
      }
      next(e);
    }
  }
}

module.exports = new JobController();
