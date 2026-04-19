const { Verification, Worker } = require('../models');

class VerificationService {
  async submitVerification(workerId, docType, docPath) {
    return await Verification.create({
      worker_id: workerId,
      doc_type: docType,
      doc_path: docPath,
      status: 'PENDING'
    });
  }

  async verifyDocument(verificationId, status) {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new Error('Invalid status');
    }

    const verification = await Verification.findByPk(verificationId);
    if (!verification) {
      throw new Error('Verification record not found');
    }

    verification.status = status;
    verification.verified_at = new Date();
    await verification.save();

    if (status === 'APPROVED') {
      const worker = await Worker.findByPk(verification.worker_id);
      if (worker) {
        worker.verified = true;
        await worker.save();
      }
    }

    return verification;
  }
}

module.exports = new VerificationService();
