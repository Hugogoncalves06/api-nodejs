# API Blog RESTful

Une API RESTful complète pour un système de blog, développée avec Node.js, Express.js et MongoDB.

## 🚀 Fonctionnalités

- **CRUD complet** pour les posts de blog
- **Authentification JWT** avec validation des tokens
- **Autorisation** basée sur les rôles (utilisateur/admin)
- **Validation des données** avec express-validator
- **Sécurité** avec Helmet, CORS, rate limiting
- **Logging** complet avec Winston
- **Pagination** pour les listes de posts
- **Recherche** de posts par mot-clé
- **Tests** unitaires et d'intégration
- **Docker** pour le déploiement

## 📋 Prérequis

- Node.js 18+
- Docker et Docker Compose
- MongoDB (optionnel si vous utilisez Docker)

## 🛠️ Installation

### Option 1: Avec Docker (Recommandé)

1. **Cloner le projet**
   ```bash
   cd api-nodejs
   ```

2. **Lancer avec Docker Compose**
   ```bash
   docker-compose up --build
   ```

L'API sera disponible sur `http://localhost:3000`

### Option 2: Installation locale

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp env.example .env
   # Éditer le fichier .env avec vos valeurs
   ```

3. **Démarrer MongoDB** (si pas déjà fait)
   ```bash
   # Avec Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   
   # Ou installer MongoDB localement
   ```

4. **Lancer l'application**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` basé sur `env.example` :

```env
# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/blog-api

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Configuration de sécurité
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Génération de JWT pour les tests

Pour générer des tokens JWT pour tester l'API :

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    user_id: 'user-id',
    email: 'user@example.com',
    role: 'user' // ou 'admin'
  },
  'your-super-secret-jwt-key-change-in-production',
  { expiresIn: '24h' }
);

console.log(token);
```

## 📚 Endpoints

### Posts

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| `GET` | `/api/posts` | Récupérer tous les posts | ❌ |
| `GET` | `/api/posts/:id` | Récupérer un post par ID | ❌ |
| `GET` | `/api/posts/search?q=keyword` | Rechercher des posts | ❌ |
| `POST` | `/api/posts` | Créer un nouveau post | ✅ |
| `PUT` | `/api/posts/:id` | Modifier un post | ✅ |
| `DELETE` | `/api/posts/:id` | Supprimer un post | ✅ |

### Autres

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/` | Informations sur l'API |
| `GET` | `/health` | Statut de santé |

### Paramètres de requête

#### Pagination
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 10)
- `sort` : Tri (défaut: '-createdAt')

#### Recherche
- `q` : Mot-clé de recherche (requis)

### Authentification

Incluez le token JWT dans le header `Authorization` :
```
Authorization: Bearer <your-jwt-token>
```

### Autorisation

- **Utilisateurs normaux** : Peuvent modifier/supprimer leurs propres posts
- **Admins** : Peuvent modifier/supprimer tous les posts

## 📝 Exemples d'utilisation

### Créer un post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "title": "Mon premier post",
    "content": "Contenu de mon premier post de blog"
  }'
```

### Récupérer tous les posts
```bash
curl http://localhost:3000/api/posts
```

### Modifier un post
```bash
curl -X PUT http://localhost:3000/api/posts/<post-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "title": "Titre modifié"
  }'
```

### Rechercher des posts
```bash
curl "http://localhost:3000/api/posts/search?q=javascript"
```

## 🧪 Tests

### Lancer tous les tests
```bash
npm test
```

### Lancer les tests en mode watch
```bash
npm run test:watch
```

### Générer un rapport de couverture
```bash
npm run test:coverage
```

### Tests disponibles

- ✅ Tests unitaires pour les contrôleurs
- ✅ Tests d'intégration pour les routes
- ✅ Tests d'authentification et d'autorisation
- ✅ Tests de validation des données
- ✅ Tests de pagination et de recherche

## 🔧 Scripts disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en mode développement
npm test           # Lancer les tests
npm run test:watch # Tests en mode watch
npm run lint       # Vérifier le code avec ESLint
npm run lint:fix   # Corriger automatiquement les erreurs ESLint
npm run format     # Formater le code avec Prettier
```

## 🏗️ Structure du projet

```
src/
├── config/
│   └── database.js          # Configuration MongoDB
├── controllers/
│   └── postController.js    # Contrôleurs pour les posts
├── middlewares/
│   ├── auth.js              # Middleware d'authentification
│   ├── authorization.js     # Middleware d'autorisation
│   └── validation.js        # Validation des données
├── models/
│   └── Post.js              # Modèle Mongoose
├── routes/
│   └── posts.js             # Routes des posts
├── utils/
│   ├── logger.js            # Configuration Winston
│   └── pagination.js        # Plugin de pagination
└── app.js                   # Application principale

tests/
├── setup.js                 # Configuration des tests
├── utils/
│   └── testUtils.js         # Utilitaires pour les tests
└── posts.test.js            # Tests des posts
```

## 🔒 Sécurité

- **Helmet** : Headers de sécurité HTTP
- **CORS** : Protection contre les requêtes cross-origin
- **Rate Limiting** : Protection contre les attaques par déni de service
- **Validation** : Validation stricte des entrées utilisateur
- **JWT** : Authentification sécurisée
- **Logging** : Traçabilité des actions sensibles

## 📊 Logging

Les logs sont stockés dans le dossier `logs/` :
- `error.log` : Erreurs uniquement
- `combined.log` : Tous les logs

En développement, les logs sont également affichés dans la console.

## 🐳 Docker

### Construction de l'image
```bash
docker build -t blog-api .
```

### Lancement avec Docker Compose
```bash
docker-compose up -d
```

### Arrêt des services
```bash
docker-compose down
```

### Voir les logs
```bash
docker-compose logs -f api
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez la documentation
2. Consultez les logs
3. Ouvrez une issue sur GitHub

## 🔄 Versions

- **v1.0.0** : Version initiale avec CRUD complet et authentification 