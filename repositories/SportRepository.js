const db = require('../db/connection');
const AppError = require('../utils/AppError');

class SportRepository {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM sports');
    return rows;
  }

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM sports WHERE sport_id = ?', [id]);
    return rows[0] || null;
  }

  async create({ name, description }) {
    const [result] = await db.query(
      'INSERT INTO sports (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    return { sport_id: result.insertId, name, description };
  }

  async update(id, { name, description }) {
    const [result] = await db.query(
      'UPDATE sports SET name = ?, description = ? WHERE sport_id = ?',
      [name, description || null, id]
    );
    if (result.affectedRows === 0) throw new AppError('Sport not found', 404);
    return { sport_id: id, name, description };
  }

  async delete(id) {
    const [result] = await db.query('DELETE FROM sports WHERE sport_id = ?', [id]);
    if (result.affectedRows === 0) throw new AppError('Sport not found', 404);
    return true;
  }
}

module.exports = SportRepository;
