import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http'; // Importer createServer depuis le module http
import { initSocketIO } from './config/socketManager.js'; // Importer votre configuration Socket.io

const prisma = new PrismaClient();
import './config/cloudinary';
import { PORT } from './config/env';
import errorHandler from './middlewares/errorHandler';
import Routes from './routes/index';
import logger from './utils/logger';
import { swaggerUi, specs } from './config/swagger';
import './utils/Tasks/ViewStatusCleanup';

const app = express();
const server = createServer(app); // Créer une instance de serveur HTTP


// Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.use(cors());

// Configuration des routes
Routes(app);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware de gestion des erreurs
app.use(errorHandler);

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialisation de Socket.io
const io = initSocketIO(server); // Passer le serveur à la configuration Socket.io

// Fonction de démarrage du serveur
const startServer = async () => {
  try {
    logger.info('Attempting to connect to the database...');

    // Test de connexion Prisma
    await prisma.$connect();
    logger.info('Successfully connected to the database');

    // Exécutez une requête simple pour vérifier la connexion
    const userCount = await prisma.user.count();
    logger.info(`Database connection test successful. User count: ${userCount}`);

    server.listen(PORT || 3000, () => { // Démarrer le serveur HTTP
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

startServer();
