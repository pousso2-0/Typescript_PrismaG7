import express from 'express';
import CommentController from '../controllers/commentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { checkCommentsEnabled } from '../middlewares/commentMiddleware';
import { postActionMiddleware } from '../middlewares/privatePostMiddleware';



const router = express.Router();

/**
 * @swagger
 * /api/comments/{postId}:
 *   post:
 *     summary: Ajouter un commentaire à un post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du post auquel ajouter un commentaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenu du commentaire
 *     responses:
 *       201:
 *         description: Commentaire créé avec succès
 *       400:
 *         description: Données invalides ou commentaires désactivés
 *       401:
 *         description: Non autorisé, authentification requise
 */
router.post('/:postId', authMiddleware, postActionMiddleware, checkCommentsEnabled, CommentController.createComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: Récupérer un commentaire spécifique
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire à récupérer
 *     responses:
 *       200:
 *         description: Commentaire récupéré avec succès
 *       404:
 *         description: Commentaire non trouvé
 */
router.get('/:id', CommentController.getComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Mettre à jour un commentaire
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nouveau contenu du commentaire
 *     responses:
 *       200:
 *         description: Commentaire mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé, authentification requise
 *       404:
 *         description: Commentaire non trouvé
 */
router.put('/:id', authMiddleware, CommentController.updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Supprimer un commentaire
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire à supprimer
 *     responses:
 *       200:
 *         description: Commentaire supprimé avec succès
 *       401:
 *         description: Non autorisé, authentification requise
 *       404:
 *         description: Commentaire non trouvé
 */
router.delete('/:id', authMiddleware, CommentController.deleteComment);

/**
 * @swagger
 * /api/comments/{commentId}/replies:
 *   post:
 *     summary: Ajouter un commentaire en réponse à un commentaire existant
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire parent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenu du commentaire
 *     responses:
 *       201:
 *         description: Commentaire créé avec succès
 *       400:
 *         description: Données invalides ou commentaires désactivés
 *       401:
 *         description: Non autorisé, authentification requise
 */
// router.post('/:commentId/replies', authMiddleware, checkCommentsEnabled, CommentController.getCommentReplies);



/**
 * @swagger
 * /api/comments/post/{postId}:
 *   get:
 *     summary: Lister tous les commentaires d'un post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du post pour lequel lister les commentaires
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           format: int32
 *         description: Numéro de la page pour la pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           format: int32
 *         description: Nombre de commentaires par page
 *     responses:
 *       200:
 *         description: Liste des commentaires récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Données invalides
 */
router.get('/post/:postId', CommentController.getCommentsByPost);





export default router;
