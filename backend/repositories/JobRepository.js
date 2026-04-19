const { Job, Employer, Application } = require('../models');

class JobRepository {
  async createJob(jobData) {
    return await Job.create(jobData);
  }

  async findAllOpenJobs(skillsFilters = null) {
    const whereClause = { status: 'OPEN' };
    
    // Simplistic array filter mapping for SQLite/Postgres. 
    // Usually Array types require specific pg ops, but kept simple for standard ORM usage.
    
    return await Job.findAll({
      where: whereClause,
      include: [{ model: Employer }]
    });
  }

  async findJobById(jobId) {
    return await Job.findByPk(jobId, {
      include: [{ model: Employer }, { model: Application }]
    });
  }

  async updateJobStatus(jobId, status) {
    return await Job.update(
      { status },
      { where: { id: jobId } }
    );
  }
}

module.exports = new JobRepository();
