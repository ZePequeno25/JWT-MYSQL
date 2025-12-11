// models/User.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

const User = {
  // CREATE - corrigido
  create: async (data) => {
    const { name, email, password } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // retorna o usuário criado sem a senha
    return {
      id: result.insertId,
      name,
      email
    };
  },

  findByEmail: async (email) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  getAll: async () => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.name) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.email) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.password) {
      const hashed = await bcrypt.hash(data.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (fields.length === 0) return null;

    values.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return true;
  },

  delete: async (id) => {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }
};

module.exports = User;