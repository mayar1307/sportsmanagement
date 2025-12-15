const db = require('../db/connection');
const AppError = require('../utils/AppError');

class UserRepository {
    async getAll() {
        const [rows] = await db.query('SELECT user_id, name, email, role, created_at, password FROM users');
        return rows;
    }

    async getById(id) {
        const [rows] = await db.query('SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?', [id]);
        if (rows.length === 0) throw new AppError('User not found', 404);
        return rows[0];
    }

    async create(user) {
        const { name, email, password, role } = user;
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role || 'user']
        );
        return { user_id: result.insertId, ...user };
    }

    async update(id, user) {
        const { name, email, password, role } = user;
        const [result] = await db.query(
            'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE user_id = ?',
            [name, email, password, role, id]
        );
        if (result.affectedRows === 0) throw new AppError('User not found', 404);
        return { user_id: id, ...user };
    }

    async delete(id) {
        const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
        if (result.affectedRows === 0) throw new AppError('User not found', 404);
        return true;
    }
    
    async getByEmail(email) {
        const [rows] = await db.query('SELECT user_id, name, email, role, created_at, password FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return null; 
        return rows[0]; 
    }
}
module.exports = UserRepository;