FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Créer le répertoire pour les logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 8000

# Définir les variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=8000

# Commande de démarrage
CMD ["npm", "start"] 