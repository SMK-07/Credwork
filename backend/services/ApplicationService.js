const { Application } = require('../models');
const StateMachine = require('../utils/stateMachine');
const eventBus = require('./eventBus');

class ApplicationService {
  async determineApplicationOutcome(applicationId, outcome, reason) {
    const application = await Application.findByPk(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    // Determine the next status based on outcome
    const nextStatus = outcome === 'GHOST' ? 'GHOSTED' : 'OUTCOME_CONFIRMED';
    
    // Validate transition
    StateMachine.validateAppTransition(application.status, nextStatus);

    application.status = nextStatus;
    application.outcome = outcome;
    await application.save();

    // Emitting event (Observer pattern)
    eventBus.emit('outcome.confirmed', {
      applicationId: application.id,
      workerId: application.worker_id,
      outcomeType: outcome,
      reasonText: reason
    });

    return application;
  }
}

module.exports = new ApplicationService();
