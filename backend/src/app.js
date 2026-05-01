const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes      = require('./routes/auth');
const projectRoutes   = require('./routes/projects');
const taskRoutes      = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes      = require('./routes/users');

const app = express();

/* ------------------------------------------------------------------ */
/* Security & utility middleware                                        */
/* ------------------------------------------------------------------ */
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/auth',      authRoutes);
app.use('/api/projects',  projectRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users',     userRoutes);

/* ------------------------------------------------------------------ */
/* 404 handler                                                         */
/* ------------------------------------------------------------------ */
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ------------------------------------------------------------------ */
/* Global error handler                                                */
/* ------------------------------------------------------------------ */
app.use(errorHandler);

module.exports = app;
