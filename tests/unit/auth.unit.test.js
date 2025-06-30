const { authenticateToken, requireAuth, requireRole } = require('../../src/middlewares/auth');
const jwt = require('jsonwebtoken');
const logger = require('../../src/utils/logger');

jest.mock('jsonwebtoken');
jest.mock('../../src/utils/logger');

describe('auth middleware', () => {
  let req, res, next;
  beforeEach(() => {
    req = { headers: {}, ip: '127.0.0.1', path: '/api' };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('retourne 401 si pas de token', () => {
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retourne 403 si token invalide', () => {
    req.headers.authorization = 'Bearer badtoken';
    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('remplit req.user et appelle next si token valide', () => {
    req.headers.authorization = 'Bearer goodtoken';
    jwt.verify.mockReturnValue({ user_id: 'id', email: 'e', role: 'user' });
    authenticateToken(req, res, next);
    expect(req.user).toEqual({ id: 'id', email: 'e', role: 'user' });
    expect(next).toHaveBeenCalled();
  });

  it('requireRole refuse si pas authentifié', () => {
    const middleware = requireRole('admin');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('requireRole refuse si mauvais rôle', () => {
    req.user = { id: 'id', role: 'user' };
    const middleware = requireRole('admin');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('requireRole passe si admin', () => {
    req.user = { id: 'id', role: 'admin' };
    const middleware = requireRole('admin');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
}); 