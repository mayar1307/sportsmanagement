const RoomRepository = require('../repositories/RoomRepository');

class RoomService {
  constructor() {
    this.repo = new RoomRepository();
  }

  getAllRooms() {
    return this.repo.getAll();
  }

  getRoomById(id) {
    return this.repo.getById(id);
  }

  createRoom(data) {
    return this.repo.create(data);
  }

  updateRoom(id, data) {
    return this.repo.update(id, data);
  }

  deleteRoom(id) {
    return this.repo.delete(id);
  }
}

module.exports = RoomService;
