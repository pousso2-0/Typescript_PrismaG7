import express from 'express';
import PostController from '../controllers/postController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import ShareFavController from '../controllers/ShareFavController';
import ShareController from '../controllers/shareController';
import ViewPostController from '../controllers/viewPostController';
import { postActionMiddleware } from '../middlewares/postActionMiddleware';
import {uploadMiddleware} from "../middlewares/uploadMiddleware";

const router = express.Router();


/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Créer un nouveau post avec des médias
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                   type: string
 *                   format: binary
 *                 description: Fichiers médias à télécharger (images ou vidéos)
 *     responses:
 *       201:
 *         description: Post créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */
router.post('/', authMiddleware, roleMiddleware(['TAILLEUR']), uploadMiddleware, PostController.createPost);


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
router.get('/posts/:id', authMiddleware,  PostController.getPostById);

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
router.put('/:id', authMiddleware, roleMiddleware(['TAILLEUR']), PostController.updatePost);

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
router.delete('/:id', authMiddleware, roleMiddleware(['TAILLEUR']), PostController.deletePost);

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
router.post('/:id/share', postActionMiddleware, PostController.incrementShareCount);

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


/**
 * @swagger
 * /api/posts/retweet:
 *   post:
 *     summary: Partager un post
 *     tags: [Retweets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: number
 *                 description: ID du post à partager
 *               content:
 *                 type: string
 *                 description: contenu a ajouer sur le post a partager
 *     responses:
 *       200:
 *         description: Post partagé avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Post non trouvé
 */
router.post('/retweet', authMiddleware,postActionMiddleware, ShareFavController.retweetPost);

/**
 * @swagger
 * /api/posts/favorites:
 *   post:
 *     summary: Ajouter un post aux favoris
 *     tags: [Favoris]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: number
 *                 description: ID du post à ajouter aux favoris
 *     responses:
 *       200:
 *         description: Post ajouté aux favoris avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Post non trouvé
 */
router.post('/favorites', authMiddleware,postActionMiddleware, ShareFavController.addToFavorites);

/**
 * @swagger
 * /api/posts/retweets:
 *   get:
 *     summary: Obtenir les posts partagés par l'utilisateur
 *     tags: [Retweets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des posts partagés par l'utilisateur
 *       404:
 *         description: Aucun post partagé trouvé
 */
router.get('/retweets', authMiddleware, ShareFavController.getUserRetweet);

/**
 * @swagger
 * /api/posts/favorites/f:
 *   get:
 *     summary: Obtenir les posts favoris de l'utilisateur
 *     tags: [Favoris]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des posts favoris de l'utilisateur
 *       404:
 *         description: Aucun post favori trouvé
 */
router.get('/favorites/f', authMiddleware, ShareFavController.getUserFavorites);

/**
 * @swagger
 * /api/posts/favorites/{postId}:
 *   delete:
 *     summary: Supprimer un post des favoris
 *     tags: [Favoris]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID du post à supprimer des favoris
 *     responses:
 *       200:
 *         description: Post supprimé des favoris avec succès
 *       400:
 *         description: Format ID de post invalide
 *       404:
 *         description: Post non trouvé dans les favoris
 */
router.delete('/favorites/:postId', authMiddleware, ShareFavController.deleteFromFavorites);

/**
 * @swagger
 * /api/posts/share:
 *   post:
 *     summary: Partager un post
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
 *               postId:
 *                 type: number
 *                 description: ID du post à partager
 *               recipients: 
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array de personne a partager le post 
 *     responses:
 *       200:
 *         description: Post partagé avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Post non trouvé
 */
router.post('/share', authMiddleware, postActionMiddleware, ShareController.sharePost);


/**
 * @swagger
 * /api/posts/view:
 *   post:
 *     summary: Enregistrer la vue d'un post
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
 *               postId:
 *                 type: string
 *                 description: ID du post dont enregistrer la vue
 *     responses:
 *       200:
 *         description: Vue enregistrée avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Post non trouvé
 */
router.post('/view', authMiddleware, postActionMiddleware, ViewPostController.recordView);




export default router;