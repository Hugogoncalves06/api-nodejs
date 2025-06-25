const jwt = require('jsonwebtoken');

// Générer un token JWT pour les tests
const generateTestToken = (userData = {}) => {
  const defaultUser = {
    user_id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
  };
  
  const user = { ...defaultUser, ...userData };
  
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// Créer un utilisateur admin pour les tests
const generateAdminToken = () => {
  return generateTestToken({
    user_id: 'admin-user-id',
    email: 'admin@example.com',
    role: 'admin',
  });
};

// Créer un utilisateur normal pour les tests
const generateUserToken = () => {
  return generateTestToken({
    user_id: 'normal-user-id',
    email: 'user@example.com',
    role: 'user',
  });
};

// Créer un autre utilisateur pour les tests
const generateOtherUserToken = () => {
  return generateTestToken({
    user_id: 'other-user-id',
    email: 'other@example.com',
    role: 'user',
  });
};

module.exports = {
  generateTestToken,
  generateAdminToken,
  generateUserToken,
  generateOtherUserToken,
}; 