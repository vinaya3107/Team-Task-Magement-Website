const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

const SALT_ROUNDS = 12;

/* ------------------------------------------------------------------ */
/* POST /api/auth/signup                                               */
/* ------------------------------------------------------------------ */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const role = 'MEMBER'; // Force role to MEMBER for all signups

    // Check duplicate email
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const { rows } = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashed, role]
    );

    const user  = rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/auth/login                                                */
/* ------------------------------------------------------------------ */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user  = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* GET /api/auth/me                                                    */
/* ------------------------------------------------------------------ */
const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { signup, login, me };
