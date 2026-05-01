const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');
const rbac    = require('../middleware/rbac');

// GET /api/users — Admin only, list all users
router.get('/', auth, rbac('ADMIN'), async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id — Admin only
router.get('/:id', auth, rbac('ADMIN'), async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/users — Admin only, create new user
router.post('/', auth, rbac('ADMIN'), async (req, res, next) => {
  try {
    const bcrypt = require('bcryptjs');
    const { name, email, password, role } = req.body;

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
      [name, email, hashed, role || 'MEMBER']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
