require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const connectDB = require('./config/database');
const logger = require('./utils/logger');
require('./utils/pagination'); // Charger le plugin de pagination

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à la base de données
connectDB();

// Middlewares de sécurité
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite chaque IP à 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/posts', require('./routes/posts'));

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'API Blog RESTful',
    version: '1.0.0',
    endpoints: {
      posts: '/api/posts',
      health: '/health',
    },
  });
});

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  logger.warn('Route non trouvée', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });
  res.status(404).json({
    error: 'Route non trouvée',
  });
});

// Middleware de gestion des erreurs global
app.use((error, req, res) => {
  logger.error('Erreur serveur', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erreur serveur interne' 
      : error.message,
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
  logger.info(`Environnement: ${process.env.NODE_ENV}`);
});

module.exports = app; 