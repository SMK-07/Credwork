const { Employer } = require('../models');

class EmployerController {
  async getProfile(req, res, next) {
    try {
      const employer = await Employer.findOne({ where: { user_id: req.user.id } });
      if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

      res.json(employer);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new EmployerController();
