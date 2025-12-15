const RoomService = require('../services/RoomService');

class RoomController {
  constructor() {
    this.service = new RoomService();
  }

  getAll = async (req, res, next) => {
    try {
      const rooms = await this.service.getAllRooms();
      res.json({ status: 'success', data: rooms });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const room = await this.service.getRoomById(req.params.id);
      if (!room) {
        return res.status(404).json({ status: 'error', message: 'Room not found' });
      }
      res.json({ status: 'success', data: room });
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const { name, location, capacity } = req.body;
      if (!name) {
        return res.status(400).json({ status: 'error', message: 'name is required' });
      }
      const room = await this.service.createRoom({ name, location, capacity });
      res.status(201).json({ status: 'success', data: room });
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const room = await this.service.updateRoom(req.params.id, req.body);
      res.json({ status: 'success', data: room });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.service.deleteRoom(req.params.id);
      res.json({ status: 'success', message: 'Room deleted' });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = RoomController;
