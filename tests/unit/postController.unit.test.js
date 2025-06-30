const postController = require('../../src/controllers/postController');
const Post = require('../../src/models/Post');
const logger = require('../../src/utils/logger');

jest.mock('../../src/models/Post');
jest.mock('../../src/utils/logger');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('postController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('createPost', () => {
    it('crée un post et retourne 201', async () => {
      const req = {
        body: { title: 'Titre', content: 'Contenu' },
        user: { id: 'user1', email: 'user1@example.com' },
      };
      const res = mockRes();
      const savedPost = { _id: 'id', ...req.body, author: 'user1', authorEmail: 'user1@example.com' };
      Post.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(savedPost) }));

      await postController.createPost(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String), post: savedPost });
    });
    it('retourne 500 en cas d\'erreur', async () => {
      const req = { body: {}, user: { id: 'user1', email: 'user1@example.com' } };
      const res = mockRes();
      Post.mockImplementation(() => ({ save: jest.fn().mockRejectedValue(new Error('fail')) }));
      await postController.createPost(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAllPosts', () => {
    it('retourne la liste paginée', async () => {
      const req = { query: {} };
      const res = mockRes();
      Post.paginate = jest.fn().mockResolvedValue({ docs: [], totalDocs: 0, page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
      await postController.getAllPosts(req, res);
      expect(res.json).toHaveBeenCalledWith({ posts: [], pagination: expect.any(Object) });
    });
    it('retourne 500 en cas d\'erreur', async () => {
      const req = { query: {} };
      const res = mockRes();
      Post.paginate = jest.fn().mockRejectedValue(new Error('fail'));
      await postController.getAllPosts(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getPostById', () => {
    it('retourne un post existant', async () => {
      const req = { params: { id: 'id' } };
      const res = mockRes();
      Post.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'id', title: 't' }) });
      await postController.getPostById(req, res);
      expect(res.json).toHaveBeenCalledWith({ post: { _id: 'id', title: 't' } });
    });
    it('retourne 404 si non trouvé', async () => {
      const req = { params: { id: 'id' } };
      const res = mockRes();
      Post.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      await postController.getPostById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('retourne 500 en cas d\'erreur', async () => {
      const req = { params: { id: 'id' } };
      const res = mockRes();
      Post.findById = jest.fn().mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('fail')) });
      await postController.getPostById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updatePost', () => {
    // it('modifie un post existant', async () => {
    //   const req = { params: { id: 'id' }, body: { title: 'new' } };
    //   const res = mockRes();
    //   Post.findByIdAndUpdate = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'id', title: 'new' }) });
    //   await postController.updatePost(req, res);
    //   expect(res.json).toHaveBeenCalledWith({ message: expect.any(String), post: { _id: 'id', title: 'new' } });
    // });
    it('retourne 404 si non trouvé', async () => {
      const req = { params: { id: 'id' }, body: {} };
      const res = mockRes();
      Post.findByIdAndUpdate = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      await postController.updatePost(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('retourne 500 en cas d\'erreur', async () => {
      const req = { params: { id: 'id' }, body: {} };
      const res = mockRes();
      Post.findByIdAndUpdate = jest.fn().mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('fail')) });
      await postController.updatePost(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deletePost', () => {
    it('retourne 404 si non trouvé', async () => {
      const req = { params: { id: 'id' } };
      const res = mockRes();
      Post.findByIdAndDelete = jest.fn().mockResolvedValue(null);
      await postController.deletePost(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('retourne 500 en cas d\'erreur', async () => {
      const req = { params: { id: 'id' } };
      const res = mockRes();
      Post.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('fail'));
      await postController.deletePost(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('searchPosts', () => {
    it('retourne 400 si q manquant', async () => {
      const req = { query: {} };
      const res = mockRes();
      await postController.searchPosts(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('retourne la liste paginée', async () => {
      const req = { query: { q: 'mot' } };
      const res = mockRes();
      Post.paginate = jest.fn().mockResolvedValue({ docs: [], totalDocs: 0, page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
      await postController.searchPosts(req, res);
      expect(res.json).toHaveBeenCalledWith({ posts: [], pagination: expect.any(Object) });
    });
    it('retourne 500 en cas d\'erreur', async () => {
      const req = { query: { q: 'mot' } };
      const res = mockRes();
      Post.paginate = jest.fn().mockRejectedValue(new Error('fail'));
      await postController.searchPosts(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
}); 