const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
    },
    content: {
      type: String,
      required: [true, 'Le contenu est requis'],
      trim: true,
      maxlength: [10000, 'Le contenu ne peut pas dépasser 10000 caractères'],
    },
    author: {
      type: String,
      required: [true, "L'identifiant de l'auteur est requis"],
      trim: true,
    },
    authorEmail: {
      type: String,
      required: [true, "L'email de l'auteur est requis"],
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour améliorer les performances
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

// Méthode pour vérifier si un utilisateur peut modifier le post
postSchema.methods.canEdit = function (userId, userRole) {
  return userRole === 'admin' || this.author === userId;
};

// Méthode pour vérifier si un utilisateur peut supprimer le post
postSchema.methods.canDelete = function (userId, userRole) {
  return userRole === 'admin' || this.author === userId;
};

module.exports = mongoose.model('Post', postSchema); 