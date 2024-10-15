import { Router } from 'express';
import ArticleController from '../controllers/articleController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import {uploadMiddleware} from "../middlewares/uploadMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Articles
 */
/**
 * @swagger
 * /api/articles/category/{categoryId}:
 *   get:
 *     summary: List articles by category for a store
 *     tags: [Articles]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of articles
 *       404:
 *         description: Not found
 */
router.get('/stores/:storeId/category/:categoryId', authMiddleware, ArticleController.listArticlesByCategoryForStore);

/**
 * @swagger
 * /api/articles/categories:
 *   get:
 *     summary: List all categories and articles
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of categories and articles
 *       500:
 *         description: Internal server error
 */
router.get('/categories' , authMiddleware, ArticleController.listAllCategoriesAndArticles);
/**
 * @swagger
 * /api/articles/store/{storeId}:
 *   post:
 *     summary: Add an article to a store
 *     tags: [Articles]
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Aguille de 10'
 *               description:
 *                 type: string
 *                 example: 'Paquet aguille de 10'
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 299.99
 *               stockCount:
 *                 type: integer
 *                 example: 50
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *               image:  # Champ pour le fichier
 *                 type: string
 *                 format: binary  # Indique que c'est un fichier binaire
 *     responses:
 *       201:
 *         description: Article added
 *       500:
 *         description: Internal server error
 */
router.post('/store/:storeId', roleMiddleware(['VENDEUR']), authMiddleware, uploadMiddleware, ArticleController.addArticleToStore);


/**
 * @swagger
 * /api/articles/stores:
 *   get:
 *     summary: Get all stores
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all stores
 *       500:
 *         description: Internal server error
 */
// Liste tous les magasins
router.get('/stores', roleMiddleware(['ADMIN', 'VENDEUR']), authMiddleware, ArticleController.getAllStores);


/**
 * @swagger
 * /api/articles/stores/user:
 *   get:
 *     summary: Get stores of the connected user
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of stores belonging to the connected user
 *       500:
 *         description: Internal server error
 */
// Liste les magasins du vendeur connecté
router.get('/stores/user', roleMiddleware(['VENDEUR']), authMiddleware, ArticleController.getStoresByUser);


/**
 * @swagger
 * /api/articles/stores:
 *   post:
 *     summary: Create a new store for a user
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Store created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/stores', roleMiddleware(['VENDEUR']), authMiddleware, ArticleController.createStore);

/**
 * @swagger
 * /api/stores/{storeId}/articles/{articleId}:
 *   delete:
 *     summary: Delete an article from a store
 *     tags: [Articles]
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: integer
 *       - name: articleId
 *         in: path
 *         required: true
 *         description: Article ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Article deleted
 *       500:
 *         description: Server error
 */
router.delete('/stores/:storeId/articles/:articleId', authMiddleware, roleMiddleware(['VENDEUR']), ArticleController.deleteArticleFromStore);


/**
 * @swagger
 * /api/articles/store/{storeId}/category/{categoryId}:
 *   delete:
 *     summary: Delete a category for a store
 *     tags: [Articles]
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: integer
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Category deleted
 *       500:
 *         description: Internal server error
 */
router.delete('/store/:storeId/category/:categoryId',roleMiddleware(['VENDEUR']), authMiddleware, ArticleController.deleteCategoryForStore);

/**
 * @swagger
 * /api/articles/store/{storeId}/:
 *   delete:
 *     summary: Delete store
 *     tags: [Articles]
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: store deleted
 *       500:
 *         description: Internal server error
 */
router.delete('/store/:storeId/' , roleMiddleware(['VENDEUR']), authMiddleware, ArticleController.deleteCategoryForStore);

/**
 * @swagger
 * /api/articles/store/{storeId}/categories:
 *   get:
 *     summary: List all categories and articles for a store
 *     tags: [Articles]
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of categories and articles for a store
 *       500:
 *         description: Internal server error
 */
router.get('/store/:storeId/categories', authMiddleware, ArticleController.listAllCategoriesForStore);


export default router;
