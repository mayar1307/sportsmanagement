const EventRepository = require('../repositories/EventRepository');

class EventService {
  constructor() {
    this.eventRepo = new EventRepository();
  }

  getAllEvents() {
    return this.eventRepo.getAll();
  }

  getEventById(id) {
    return this.eventRepo.getById(id);
  }

  createEvent(data) {
    return this.eventRepo.create(data);
  }

  updateEvent(id, data) {
    return this.eventRepo.update(id, data);
  }

  deleteEvent(id) {
    return this.eventRepo.delete(id);
  }

  registerUser(event_id, user_id) {
    return this.eventRepo.registerUser(event_id, user_id);
  }

  unregisterUser(event_id, user_id) {
    return this.eventRepo.unregisterUser(event_id, user_id);
  }

  getRegistrationsForEvent(event_id) {
    return this.eventRepo.getRegistrationsForEvent(event_id);
  }

  getEventsForUser(user_id) {
    return this.eventRepo.getEventsForUser(user_id);
  }
}

module.exports = EventService;