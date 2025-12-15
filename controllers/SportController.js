const SportService = require('../services/SportService');

class SportController {
  constructor() {
    this.service = new SportService();
  }

  getAll = async (req, res, next) => {
    try {
      const sports = await this.service.getAllSports();
      res.json({ status: 'success', data: sports });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const sport = await this.service.getSportById(req.params.id);
      if (!sport) {
        return res.status(404).json({ status: 'error', message: 'Sport not found' });
      }
      res.json({ status: 'success', data: sport });
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ status: 'error', message: 'name is required' });
      }
      const sport = await this.service.createSport({ name, description });
      res.status(201).json({ status: 'success', data: sport });
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const sport = await this.service.updateSport(req.params.id, req.body);
      res.json({ status: 'success', data: sport });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.service.deleteSport(req.params.id);
      res.json({ status: 'success', message: 'Sport deleted' });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = SportController;
