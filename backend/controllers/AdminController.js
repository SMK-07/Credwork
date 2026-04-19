const { Verification, Worker } = require('../models');
const VerificationService = require('../services/VerificationService');
const DisputeRepository = require('../repositories/DisputeRepository');

class AdminController {
  async listVerifications(req, res, next) {
    try {
      const verifications = await Verification.findAll({
        where: { status: 'PENDING' },
        include: [{ model: Worker }]
      });
      res.json(verifications);
    } catch (e) {
      next(e);
    }
  }

  async resolveVerification(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body; // APPROVED or REJECTED
      const result = await VerificationService.verifyDocument(id, status);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async listDisputes(req, res, next) {
    try {
      const disputes = await DisputeRepository.findAllOpenDisputes();
      res.json(disputes);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new AdminController();
