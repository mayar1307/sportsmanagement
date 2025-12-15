const SportRepository = require('../repositories/SportRepository');

class SportService {
  constructor() {
    this.repo = new SportRepository();
  }

  getAllSports() {
    return this.repo.getAll();
  }

  getSportById(id) {
    return this.repo.getById(id);
  }

  createSport(data) {
    return this.repo.create(data);
  }

  updateSport(id, data) {
    return this.repo.update(id, data);
  }

  deleteSport(id) {
    return this.repo.delete(id);
  }
}

module.exports = SportService;
