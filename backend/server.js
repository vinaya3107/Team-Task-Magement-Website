require('dotenv').config();
const app = require('./src/app');
const db  = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Verify DB connection
    await db.query('SELECT 1');
    console.log('✅ PostgreSQL connected');

    // Auto-create Admin if not exists
    const bcrypt = require('bcryptjs');
    const adminCheck = await db.query("SELECT id FROM users WHERE role = 'ADMIN'");
    if (adminCheck.rows.length === 0) {
      const hashed = await bcrypt.hash('admin123', 12);
      await db.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
        ['Admin User', 'admin@example.com', hashed, 'ADMIN']
      );
      console.log('✅ Default ADMIN created (Email: admin@example.com | Password: admin123)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to the database:', err.message);
    process.exit(1);
  }
};

start();
