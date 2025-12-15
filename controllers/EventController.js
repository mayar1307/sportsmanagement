const EventService = require('../services/EventService');

class EventController {
  constructor() {
    this.eventService = new EventService();
  }

  getAll = async (req, res, next) => {
    try {
      const events = await this.eventService.getAllEvents();
      res.json({ status: 'success', data: events });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const event = await this.eventService.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ status: 'error', message: 'Event not found' });
      }
      res.json({ status: 'success', data: event });
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const { title, description, date, time, capacity, sport_id, room_id } = req.body;

      if (!title || !date || !time || !capacity) {
        return res.status(400).json({
          status: 'error',
          message: 'title, date, time and capacity are required',
        });
      }

      const coach_id = req.user.id; // from JWT
      const event = await this.eventService.createEvent({
        title,
        description,
        date,
        time,
        capacity,
        coach_id,
        sport_id,
        room_id,
      });

      res.status(201).json({ status: 'success', data: event });
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const event = await this.eventService.updateEvent(req.params.id, req.body);
      res.json({ status: 'success', data: event });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.eventService.deleteEvent(req.params.id);
      res.json({ status: 'success', message: 'Event deleted' });
    } catch (err) {
      next(err);
    }
  };

  register = async (req, res, next) => {
    try {
      const registration = await this.eventService.registerUser(req.params.id, req.user.id);
      res.status(201).json({ status: 'success', data: registration });
    } catch (err) {
      next(err);
    }
  };

  unregister = async (req, res, next) => {
    try {
      await this.eventService.unregisterUser(req.params.id, req.user.id);
      res.json({ status: 'success', message: 'Unregistered from event' });
    } catch (err) {
      next(err);
    }
  };

  getUserEvents = async (req, res, next) => {
    try {
      const events = await this.eventService.getEventsForUser(req.user.id);
      res.json({ status: 'success', data: events });
    } catch (err) {
      next(err);
    }
  };

  getEventRegistrations = async (req, res, next) => {
    try {
      const registrations = await this.eventService.getRegistrationsForEvent(req.params.id);
      res.json({ status: 'success', data: registrations });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = EventController;