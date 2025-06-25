const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const { requireAuth } = require('../middlewares/auth');
const { canEditPost, canDeletePost } = require('../middlewares/authorization');
const { validatePost, validateUpdatePost, handleValidationErrors } = require('../middlewares/validation');

// Routes publiques
router.get('/', postController.getAllPosts);
router.get('/search', postController.searchPosts);
router.get('/:id', postController.getPostById);

// Routes protégées
router.post('/', requireAuth, validatePost, handleValidationErrors, postController.createPost);
router.put('/:id', requireAuth, canEditPost, validateUpdatePost, handleValidationErrors, postController.updatePost);
router.delete('/:id', requireAuth, canDeletePost, postController.deletePost);

module.exports = router; 