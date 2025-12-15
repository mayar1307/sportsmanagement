const db = require('../db/connection');
const AppError = require('../utils/AppError');

class RoomRepository {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM rooms');
    return rows;
  }

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM rooms WHERE room_id = ?', [id]);
    return rows[0] || null;
  }

  async create({ name, location, capacity }) {
    const [result] = await db.query(
      'INSERT INTO rooms (name, location, capacity) VALUES (?, ?, ?)',
      [name, location || null, capacity || null]
    );
    return { room_id: result.insertId, name, location, capacity };
  }

  async update(id, { name, location, capacity }) {
    const [result] = await db.query(
      'UPDATE rooms SET name = ?, location = ?, capacity = ? WHERE room_id = ?',
      [name, location || null, capacity || null, id]
    );
    if (result.affectedRows === 0) throw new AppError('Room not found', 404);
    return { room_id: id, name, location, capacity };
  }

  async delete(id) {
    const [result] = await db.query('DELETE FROM rooms WHERE room_id = ?', [id]);
    if (result.affectedRows === 0) throw new AppError('Room not found', 404);
    return true;
  }
}

module.exports = RoomRepository;
