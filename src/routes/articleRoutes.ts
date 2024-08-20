import express from 'express';
import ArticleController from '../controllers/articleController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';


const router = express.Router();

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Créer un nouvel article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateArticleDto'
 *     responses:
 *       201:
 *         description: Article créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Erreur de requête
 */
router.post('/', authMiddleware, roleMiddleware(['VENDEUR']), ArticleController.createArticle);

/**
 * @swagger
 * /articles/vendor/{vendorId}:
 *   get:
 *     summary: Obtenir les articles par vendeur
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des articles du vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 *       400:
 *         description: Erreur de requête
 */
router.get('/vendor/:vendorId', ArticleController.getArticlesByVendor);

/**
 * @swagger
 * /articles/category/{categoryId}:
 *   get:
 *     summary: Obtenir les articles par catégorie
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des articles de la catégorie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 *       400:
 *         description: Erreur de requête
 */
router.get('/category/:categoryId', ArticleController.getArticlesByCategory);

export default router;