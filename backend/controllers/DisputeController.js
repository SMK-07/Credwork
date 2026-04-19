const DisputeRepository = require('../repositories/DisputeRepository');
const eventBus = require('../services/eventBus');

class DisputeController {
  async raiseDispute(req, res, next) {
    try {
      const { application_id, description } = req.body;
      const dispute = await DisputeRepository.createDispute({
        application_id,
        description,
        raised_by: req.user.id,
        status: 'OPEN'
      });
      res.status(201).json(dispute);
    } catch (e) {
      next(e);
    }
  }

  async resolveDispute(req, res, next) {
    try {
      const { id } = req.params;
      const { resolution } = req.body; // WORKER_FAVOUR or WORKER_FAULT
      
      const dispute = await DisputeRepository.findDisputeById(id);
      if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

      await DisputeRepository.updateDisputeStatus(id, 'RESOLVED');

      // Map resolution to outcomeType for Scoring Strategy
      const outcomeType = resolution === 'WORKER_FAVOUR' ? 'DISPUTE_WON' : 'DISPUTE_LOST';
      const reasonText = dispute.description;

      // Trigger observer event for score update
      eventBus.emit('dispute.resolved', {
        applicationId: dispute.application_id,
        workerId: dispute.Application.worker_id,
        outcomeType,
        reasonText
      });

      res.json({ message: 'Dispute resolved', disputeId: id, resolution });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new DisputeController();
