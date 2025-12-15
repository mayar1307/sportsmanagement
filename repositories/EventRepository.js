const db = require('../db/connection');
const AppError = require('../utils/AppError');

class EventRepository {
  async getAll() {
    const [rows] = await db.query(
      `SELECT e.*,
              u.name AS coach_name,
              s.name AS sport_name,
              r.name AS room_name
       FROM events e
       JOIN users  u ON e.coach_id = u.user_id
       LEFT JOIN sports s ON e.sport_id = s.sport_id
       LEFT JOIN rooms  r ON e.room_id  = r.room_id`
    );
    return rows;
  }

  async getById(id) {
    const [rows] = await db.query(
      `SELECT e.*,
              u.name AS coach_name,
              s.name AS sport_name,
              r.name AS room_name
       FROM events e
       JOIN users  u ON e.coach_id = u.user_id
       LEFT JOIN sports s ON e.sport_id = s.sport_id
       LEFT JOIN rooms  r ON e.room_id  = r.room_id
       WHERE e.event_id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async create(event) {
    const { title, description, date, time, capacity, coach_id, sport_id, room_id } = event;
    const [result] = await db.query(
      `INSERT INTO events (title, description, date, time, capacity, coach_id, sport_id, room_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date, time, capacity, coach_id, sport_id || null, room_id || null]
    );
    return { event_id: result.insertId, ...event };
  }

  async update(id, event) {
    const { title, description, date, time, capacity, sport_id, room_id } = event;
    const [result] = await db.query(
      `UPDATE events
       SET title = ?, description = ?, date = ?, time = ?, capacity = ?, sport_id = ?, room_id = ?
       WHERE event_id = ?`,
      [title, description, date, time, capacity, sport_id || null, room_id || null, id]
    );
    if (result.affectedRows === 0) throw new AppError('Event not found', 404);
    return { event_id: id, ...event };
  }

  async delete(id) {
    await db.query('DELETE FROM event_registrations WHERE event_id = ?', [id]);
    const [result] = await db.query('DELETE FROM events WHERE event_id = ?', [id]);
    if (result.affectedRows === 0) throw new AppError('Event not found', 404);
    return true;
  }

  async registerUser(event_id, user_id) {
    const [[{ count }]] = await db.query(
      'SELECT COUNT(*) AS count FROM event_registrations WHERE event_id = ?',
      [event_id]
    );

    const [capRows] = await db.query(
      'SELECT capacity FROM events WHERE event_id = ?',
      [event_id]
    );
    if (!capRows[0]) throw new AppError('Event not found', 404);

    const capacity = capRows[0].capacity;
    if (count >= capacity) throw new AppError('Event is full', 400);

    try {
      const [result] = await db.query(
        `INSERT INTO event_registrations (user_id, event_id)
         VALUES (?, ?)`,
        [user_id, event_id]
      );
      return { registration_id: result.insertId, user_id, event_id };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new AppError('You are already registered for this event', 400);
      }
      throw err;
    }
  }

  async unregisterUser(event_id, user_id) {
    await db.query(
      `DELETE FROM event_registrations
       WHERE event_id = ? AND user_id = ?`,
      [event_id, user_id]
    );
    return { event_id, user_id };
  }

  async getRegistrationsForEvent(event_id) {
    const [rows] = await db.query(
      `SELECT er.registration_id, er.registered_at,
              u.user_id, u.name, u.email
       FROM event_registrations er
       JOIN users u ON er.user_id = u.user_id
       WHERE er.event_id = ?`,
      [event_id]
    );
    return rows;
  }

  async getEventsForUser(user_id) {
    const [rows] = await db.query(
      `SELECT e.*
       FROM events e
       JOIN event_registrations er ON e.event_id = er.event_id
       WHERE er.user_id = ?`,
      [user_id]
    );
    return rows;
  }

}

module.exports = EventRepository;
