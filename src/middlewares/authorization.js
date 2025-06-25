const Post = require('../models/Post');
const logger = require('../utils/logger');

const canEditPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ 
        error: 'Post non trouvé' 
      });
    }

    if (!post.canEdit(req.user.id, req.user.role)) {
      logger.warn('Tentative de modification non autorisée', {
        user: req.user.id,
        postId: req.params.id,
        postAuthor: post.author,
      });
      return res.status(403).json({ 
        error: 'Vous n\'êtes pas autorisé à modifier ce post' 
      });
    }

    req.post = post;
    next();
  } catch (error) {
    logger.error('Erreur lors de la vérification des permissions', error);
    res.status(500).json({ 
      error: 'Erreur serveur' 
    });
  }
};

const canDeletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ 
        error: 'Post non trouvé' 
      });
    }

    if (!post.canDelete(req.user.id, req.user.role)) {
      logger.warn('Tentative de suppression non autorisée', {
        user: req.user.id,
        postId: req.params.id,
        postAuthor: post.author,
      });
      return res.status(403).json({ 
        error: 'Vous n\'êtes pas autorisé à supprimer ce post' 
      });
    }

    req.post = post;
    next();
  } catch (error) {
    logger.error('Erreur lors de la vérification des permissions', error);
    res.status(500).json({ 
      error: 'Erreur serveur' 
    });
  }
};

module.exports = {
  canEditPost,
  canDeletePost,
}; 