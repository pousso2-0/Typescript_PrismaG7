import express from 'express';
import ReactionController from '../controllers/reactionController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { postActionMiddleware } from '../middlewares/postActionMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/reactions:
 *   post:
 *     summary: Ajouter ou supprimer une réaction
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reactionType:
 *                 type: string
 *               postId:
 *                 type: integer
 *               commentId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Réaction ajoutée ou mise à jour avec succès
 *       204:
 *         description: Réaction supprimée avec succès
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 */
router.post('/', authMiddleware, postActionMiddleware , ReactionController.toggleReaction);

/**
 * @swagger
 * /api/reactions/posts/{postId}:
 *   get:
 *     summary: Obtenir toutes les réactions pour un post
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des réactions pour le post
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Post non trouvé
 */
router.get('/posts/:postId', authMiddleware, ReactionController.getReactionsForPost);

/**
 * @swagger
 * /api/reactions/comments/{commentId}:
 *   get:
 *     summary: Obtenir toutes les réactions pour un commentaire
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des réactions pour le commentaire
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Commentaire non trouvé
 */
router.get('/comments/:commentId', authMiddleware, ReactionController.getReactionsForComment);

export default router;