#!/usr/bin/env node

const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Fonction pour générer un token
function generateToken(userData) {
  const token = jwt.sign(userData, JWT_SECRET, {
    expiresIn: '24h',
  });
  
  console.log('\n=== Token JWT généré ===');
  console.log('User ID:', userData.user_id);
  console.log('Email:', userData.email);
  console.log('Role:', userData.role);
  console.log('\nToken:');
  console.log(token);
  console.log('\n=== Utilisation ===');
  console.log('Authorization: Bearer', token);
  console.log('========================\n');
  
  return token;
}

// Tokens prédéfinis
const tokens = {
  user: {
    user_id: 'normal-user-id',
    email: 'user@example.com',
    role: 'user',
  },
  admin: {
    user_id: 'admin-user-id',
    email: 'admin@example.com',
    role: 'admin',
  },
  other: {
    user_id: 'other-user-id',
    email: 'other@example.com',
    role: 'user',
  },
};

// Récupérer le type de token depuis les arguments
const tokenType = process.argv[2] || 'user';

if (tokens[tokenType]) {
  generateToken(tokens[tokenType]);
} else {
  console.log('Types de tokens disponibles:');
  console.log('- user (utilisateur normal)');
  console.log('- admin (administrateur)');
  console.log('- other (autre utilisateur)');
  console.log('\nUsage: node scripts/generate-token.js [user|admin|other]');
} 