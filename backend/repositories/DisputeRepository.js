const { Dispute, Application, User } = require('../models');

class DisputeRepository {
  async createDispute(disputeData) {
    return await Dispute.create(disputeData);
  }

  async findDisputeById(disputeId) {
    return await Dispute.findByPk(disputeId, {
      include: [{ model: Application }, { model: User }]
    });
  }

  async updateDisputeStatus(disputeId, status, transaction = null) {
    return await Dispute.update(
      { status, resolved_at: new Date() },
      { where: { id: disputeId }, transaction }
    );
  }

  async findAllOpenDisputes() {
    return await Dispute.findAll({
      where: { status: 'OPEN' },
      include: [{ model: Application }]
    });
  }
}

module.exports = new DisputeRepository();
