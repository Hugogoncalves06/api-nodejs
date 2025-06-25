const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

const validatePost = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Le titre doit contenir entre 1 et 200 caractères')
    .escape(),
  
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Le contenu doit contenir entre 1 et 10000 caractères')
    .escape(),
];

const validateUpdatePost = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Le titre doit contenir entre 1 et 200 caractères')
    .escape(),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Le contenu doit contenir entre 1 et 10000 caractères')
    .escape(),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Erreurs de validation', {
      errors: errors.array(),
      ip: req.ip,
      path: req.path,
    });
    
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array(),
    });
  }
  
  next();
};

module.exports = {
  validatePost,
  validateUpdatePost,
  handleValidationErrors,
}; 