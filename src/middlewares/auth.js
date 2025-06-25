const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Tentative d\'accès sans token', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({ 
      error: 'Token d\'accès requis' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    logger.warn('Token invalide', { 
      ip: req.ip, 
      path: req.path,
      error: error.message 
    });
    return res.status(403).json({ 
      error: 'Token invalide' 
    });
  }
};

const requireAuth = (req, res, next) => {
  authenticateToken(req, res, next);
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentification requise' 
      });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      logger.warn('Tentative d\'accès non autorisé', {
        user: req.user.id,
        requiredRole: role,
        userRole: req.user.role,
        path: req.path,
      });
      return res.status(403).json({ 
        error: 'Permissions insuffisantes' 
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireAuth,
  requireRole,
}; 