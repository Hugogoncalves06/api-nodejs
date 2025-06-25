const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Post = require('../src/models/Post');
const { generateUserToken, generateAdminToken, generateOtherUserToken } = require('./utils/testUtils');

require('./setup');

describe('API Posts', () => {
  let userToken, adminToken, otherUserToken;

  beforeEach(() => {
    userToken = generateUserToken();
    adminToken = generateAdminToken();
    otherUserToken = generateOtherUserToken();
  });

  describe('GET /api/posts', () => {
    it('devrait récupérer tous les posts', async () => {
      // Créer des posts de test
      await Post.create([
        {
          title: 'Post 1',
          content: 'Contenu du post 1',
          author: 'user1',
          authorEmail: 'user1@example.com',
        },
        {
          title: 'Post 2',
          content: 'Contenu du post 2',
          author: 'user2',
          authorEmail: 'user2@example.com',
        },
      ]);

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.posts).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalDocs).toBe(2);
    });

    it('devrait supporter la pagination', async () => {
      // Créer 15 posts
      const posts = Array.from({ length: 15 }, (_, i) => ({
        title: `Post ${i + 1}`,
        content: `Contenu du post ${i + 1}`,
        author: `user${i}`,
        authorEmail: `user${i}@example.com`,
      }));

      await Post.create(posts);

      const response = await request(app)
        .get('/api/posts?page=1&limit=10')
        .expect(200);

      expect(response.body.posts).toHaveLength(10);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.hasNextPage).toBe(true);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('devrait récupérer un post par ID', async () => {
      const post = await Post.create({
        title: 'Test Post',
        content: 'Test Content',
        author: 'user1',
        authorEmail: 'user1@example.com',
      });

      const response = await request(app)
        .get(`/api/posts/${post._id}`)
        .expect(200);

      expect(response.body.post.title).toBe('Test Post');
      expect(response.body.post.content).toBe('Test Content');
    });

    it('devrait retourner 404 pour un post inexistant', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/posts/${fakeId}`)
        .expect(404);
    });
  });

  describe('POST /api/posts', () => {
    it('devrait créer un nouveau post avec authentification', async () => {
      const postData = {
        title: 'Nouveau Post',
        content: 'Contenu du nouveau post',
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.post.title).toBe('Nouveau Post');
      expect(response.body.post.author).toBe('normal-user-id');
      expect(response.body.post.authorEmail).toBe('user@example.com');
    });

    it('devrait refuser la création sans authentification', async () => {
      const postData = {
        title: 'Nouveau Post',
        content: 'Contenu du nouveau post',
      };

      await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);
    });

    it('devrait valider les données du post', async () => {
      const invalidPostData = {
        title: '', // Titre vide
        content: 'Contenu valide',
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidPostData)
        .expect(400);

      expect(response.body.error).toBe('Données invalides');
    });
  });

  describe('PUT /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        title: 'Post Original',
        content: 'Contenu original',
        author: 'normal-user-id',
        authorEmail: 'user@example.com',
      });
    });

    it('devrait permettre à l\'auteur de modifier son post', async () => {
      const updateData = {
        title: 'Post Modifié',
        content: 'Contenu modifié',
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.post.title).toBe('Post Modifié');
      expect(response.body.post.content).toBe('Contenu modifié');
    });

    it('devrait permettre à un admin de modifier n\'importe quel post', async () => {
      const updateData = {
        title: 'Post Modifié par Admin',
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.post.title).toBe('Post Modifié par Admin');
    });

    it('devrait refuser la modification par un autre utilisateur', async () => {
      const updateData = {
        title: 'Tentative de modification',
      };

      await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateData)
        .expect(403);
    });

    it('devrait refuser la modification sans authentification', async () => {
      const updateData = {
        title: 'Tentative sans auth',
      };

      await request(app)
        .put(`/api/posts/${testPost._id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        title: 'Post à supprimer',
        content: 'Contenu à supprimer',
        author: 'normal-user-id',
        authorEmail: 'user@example.com',
      });
    });

    it('devrait permettre à l\'auteur de supprimer son post', async () => {
      await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Vérifier que le post a été supprimé
      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    it('devrait permettre à un admin de supprimer n\'importe quel post', async () => {
      await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('devrait refuser la suppression par un autre utilisateur', async () => {
      await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('devrait retourner 404 pour un post inexistant', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .delete(`/api/posts/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('GET /api/posts/search', () => {
    beforeEach(async () => {
      await Post.create([
        {
          title: 'JavaScript Tutorial',
          content: 'Learn JavaScript programming',
          author: 'user1',
          authorEmail: 'user1@example.com',
        },
        {
          title: 'Node.js Guide',
          content: 'Complete Node.js development guide',
          author: 'user2',
          authorEmail: 'user2@example.com',
        },
        {
          title: 'Python Basics',
          content: 'Introduction to Python programming',
          author: 'user3',
          authorEmail: 'user3@example.com',
        },
      ]);
    });

    it('devrait rechercher des posts par mot-clé', async () => {
      const response = await request(app)
        .get('/api/posts/search?q=JavaScript')
        .expect(200);

      expect(response.body.posts.length).toBeGreaterThan(0);
      expect(response.body.posts[0].title).toContain('JavaScript');
    });

    it('devrait retourner une erreur sans paramètre de recherche', async () => {
      await request(app)
        .get('/api/posts/search')
        .expect(400);
    });
  });
}); 