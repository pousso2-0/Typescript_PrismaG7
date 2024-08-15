import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';



import { PORT } from './config/env';
import errorHandler from './middlewares/errorHandler';
import Routes from './routes/index';
import logger from './utils/logger';
// import configureRoutes from './routes';
import { swaggerUi, specs } from './config/swagger';

const app = express();

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

// Fonction de démarrage du serveur
const startServer = async () => {
    try {
      logger.info('Attempting to connect to MongoDB...');
      logger.info('Successfully connected to MongoDB');
  
      app.listen(PORT || 3000, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  };

startServer();