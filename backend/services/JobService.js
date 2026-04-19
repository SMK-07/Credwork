const { Job, Employer } = require('../models');
const StateMachine = require('../utils/stateMachine');

class JobService {
  async createJob(employerId, data) {
    return await Job.create({ ...data, employer_id: employerId });
  }

  async assignWorker(jobId) {
    const job = await Job.findByPk(jobId);
    if (!job) throw new Error('Job not found');
    
    StateMachine.validateJobTransition(job.status, 'ASSIGNED');
    job.status = 'ASSIGNED';
    await job.save();
    return job;
  }
}

module.exports = new JobService();
