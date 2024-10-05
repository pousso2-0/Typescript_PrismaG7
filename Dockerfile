FROM node:18

# Créer un répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de configuration
COPY package*.json ./
COPY . .

# Installer les dépendances
RUN npm install --production

# Exposer le port
EXPOSE 5000

# Démarrer l'application
CMD ["node", "dist/index.js"]
