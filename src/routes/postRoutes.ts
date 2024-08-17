import express from 'express';
import PostController from '../controllers/postController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Créer un nouveau post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenu du post
 *               isPublic:
 *                 type: boolean
 *                 description: Indique si le post est public ou non
 *               commentsEnabled:
 *                 type: boolean
 *                 description: Indique si les commentaires sont activés pour ce post
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *     responses:
 *       201:
 *         description: Post créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', authMiddleware, PostController.createPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Récupérer un post par son ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du post
 *       404:
 *         description: Post non trouvé
 */
router.get('/:id', PostController.getPostById);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Mettre à jour un post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               commentsEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post mis à jour avec succès
 *       400:
 *         description: Données invalides ou non autorisé
 */
router.put('/:id', authMiddleware, PostController.updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Supprimer un post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post supprimé avec succès
 *       400:
 *         description: Non autorisé ou post non trouvé
 */
router.delete('/:id', authMiddleware, PostController.deletePost);

/**
 * @swagger
 * /api/posts/user/{userId}:
 *   get:
 *     summary: Récupérer les posts d'un utilisateur
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des posts de l'utilisateur
 *       400:
 *         description: Erreur lors de la récupération des posts
 */
router.get('/user/:userId', PostController.getUserPosts);

/**
 * @swagger
 * /api/posts/{id}/share:
 *   post:
 *     summary: Incrémenter le compteur de partages d'un post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compteur de partages incrémenté avec succès
 *       400:
 *         description: Erreur lors de l'incrémentation du compteur
 */
router.post('/:id/share', PostController.incrementShareCount);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Récupérer tous les posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste de tous les posts
 *       400:
 *         description: Erreur lors de la récupération des posts
 */
router.get('/', PostController.getAllPosts);

export default router;