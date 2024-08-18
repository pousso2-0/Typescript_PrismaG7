import express from 'express';
import FeedController from '../controllers/feedController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/feed:
 *   get:
 *     summary: Récupérer le fil d'actualité complet
 *     tags: [Feeds]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fil d'actualité complet récupéré avec succès
 *       401:
 *         description: Non autorisé, authentification requise
 */
router.get('/', authMiddleware, FeedController.getUserFeed);

/**
 * @swagger
 * /api/feed/follow:
 *   get:
 *     summary: Récupérer uniquement les posts et partages des utilisateurs suivis
 *     tags: [Feeds]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts et partages des utilisateurs suivis récupérés avec succès
 *       401:
 *         description: Non autorisé, authentification requise
 */
router.get('/follow', authMiddleware, FeedController.getUserFeed);

export default router;
