const Post = require('../models/Post');
const logger = require('../utils/logger');

// Créer un nouveau post
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const post = new Post({
      title,
      content,
      author: req.user.id,
      authorEmail: req.user.email,
    });

    const savedPost = await post.save();
    
    logger.info('Post créé avec succès', {
      postId: savedPost._id,
      author: req.user.id,
    });

    res.status(201).json({
      message: 'Post créé avec succès',
      post: savedPost,
    });
  } catch (error) {
    logger.error('Erreur lors de la création du post', error);
    res.status(500).json({
      error: 'Erreur lors de la création du post',
    });
  }
};

// Récupérer tous les posts
const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      select: '-__v',
    };

    const posts = await Post.paginate({}, options);
    
    logger.info('Posts récupérés avec succès', {
      count: posts.docs.length,
      total: posts.totalDocs,
    });

    res.json({
      posts: posts.docs,
      pagination: {
        currentPage: posts.page,
        totalPages: posts.totalPages,
        totalDocs: posts.totalDocs,
        hasNextPage: posts.hasNextPage,
        hasPrevPage: posts.hasPrevPage,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des posts', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des posts',
    });
  }
};

// Récupérer un post par ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('-__v');
    
    if (!post) {
      return res.status(404).json({
        error: 'Post non trouvé',
      });
    }

    logger.info('Post récupéré avec succès', {
      postId: post._id,
    });

    res.json({ post });
  } catch (error) {
    logger.error('Erreur lors de la récupération du post', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du post',
    });
  }
};

// Modifier un post
const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedPost) {
      return res.status(404).json({
        error: 'Post non trouvé',
      });
    }

    logger.info('Post modifié avec succès', {
      postId: updatedPost._id,
      author: req.user.id,
    });

    res.json({
      message: 'Post modifié avec succès',
      post: updatedPost,
    });
  } catch (error) {
    logger.error('Erreur lors de la modification du post', error);
    res.status(500).json({
      error: 'Erreur lors de la modification du post',
    });
  }
};

// Supprimer un post
const deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    
    if (!deletedPost) {
      return res.status(404).json({
        error: 'Post non trouvé',
      });
    }

    logger.info('Post supprimé avec succès', {
      postId: deletedPost._id,
      author: req.user.id,
    });

    res.json({
      message: 'Post supprimé avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression du post', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du post',
    });
  }
};

// Rechercher des posts
const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Le paramètre de recherche "q" est requis',
      });
    }

    const searchQuery = {
      $text: { $search: q },
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { score: { $meta: 'textScore' } },
      select: '-__v',
    };

    const posts = await Post.paginate(searchQuery, options);
    
    logger.info('Recherche de posts effectuée', {
      query: q,
      count: posts.docs.length,
      total: posts.totalDocs,
    });

    res.json({
      posts: posts.docs,
      pagination: {
        currentPage: posts.page,
        totalPages: posts.totalPages,
        totalDocs: posts.totalDocs,
        hasNextPage: posts.hasNextPage,
        hasPrevPage: posts.hasPrevPage,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la recherche de posts', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche de posts',
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  searchPosts,
}; 